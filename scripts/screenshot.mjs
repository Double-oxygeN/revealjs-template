#!/usr/bin/env node
// Copyright 2026 Yuya Shiratori (template author)
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     https://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Usage:
//   npm run screenshot              # capture all slides
//   npm run screenshot -- 3 5-7     # capture only horizontal slides 3, 5, 6, 7
//
// Indices are 0-based horizontal slide positions, matching `h` in the
// output filename `slide-h-v-f.png`.

import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer';
import { createServer } from 'vite';

const ROOT = resolve(import.meta.dirname, '..');
const MERMAID_TIMEOUT_MS = 5_000;

// Disable CSS transitions/animations so each state renders in its final form
const NO_MOTION_CSS = `
*, *::before, *::after {
  transition: none !important;
  animation: none !important;
}`;

function makeTimestampDir() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const stamp =
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return resolve(ROOT, 'screenshots', stamp);
}

// Parse arguments like `3` or `5-7` into a set of horizontal indices.
// Returns null when no arguments are given (= capture all slides).
function parseSlideArgs(args) {
  if (args.length === 0) return null;

  const indices = new Set();
  for (const arg of args) {
    const m = /^(\d+)(?:-(\d+))?$/.exec(arg);
    if (!m) throw new Error(`Invalid slide index: "${arg}" (expected e.g. 3 or 5-7)`);
    const from = Number(m[1]);
    const to = m[2] === undefined ? from : Number(m[2]);
    if (from > to) throw new Error(`Invalid slide range: "${arg}"`);
    for (let h = from; h <= to; h++) indices.add(h);
  }
  return indices;
}

function elapsed(start) {
  return `${((performance.now() - start) / 1000).toFixed(2)}s`;
}

// Start Vite dev server in-process. Falls back to another port if 5173 is in use.
async function startServer() {
  const server = await createServer({
    root: ROOT,
    logLevel: 'error',
    server: { port: 5173, strictPort: false },
  });
  await server.listen();
  return server;
}

// Wait until the current slide is fully rendered (fonts, Mermaid, images).
// Returns a list of warning messages.
function waitForSlideRendered(page) {
  return page.evaluate(async (mermaidTimeout) => {
    const nextFrame = () => new Promise((r) => requestAnimationFrame(r));
    const warnings = [];

    // Let layout run first so fonts for newly displayed slides start loading
    await nextFrame();
    await document.fonts.ready;

    const slide = window.__reveal__.getCurrentSlide();

    // Mermaid renders asynchronously on `slidechanged`. While rendering, it
    // draws into a temporary `<div><svg>` inside the element, then replaces the
    // element's content with the final `<svg>`, so wait for a direct child svg.
    const diagrams = [...slide.querySelectorAll('pre.mermaid')];
    const deadline = performance.now() + mermaidTimeout;
    while (diagrams.some((el) => !el.querySelector(':scope > svg'))) {
      if (performance.now() > deadline) {
        warnings.push('Mermaid diagram did not render in time (syntax error?)');
        break;
      }
      await new Promise((r) => setTimeout(r, 20));
    }

    await Promise.all(
      [...slide.querySelectorAll('img')].map((img) => img.decode().catch(() => {}))
    );

    await nextFrame();
    return warnings;
  }, MERMAID_TIMEOUT_MS);
}

async function takeScreenshots() {
  const selected = parseSlideArgs(process.argv.slice(2));
  const startedAt = performance.now();

  console.log('Starting Vite dev server and browser...');
  const [serverResult, browserResult] = await Promise.allSettled([
    startServer().then((s) => {
      console.log(`Server is ready. (${elapsed(startedAt)})`);
      return s;
    }),
    puppeteer.launch({ headless: true, args: ['--no-sandbox'] }).then((b) => {
      console.log(`Browser is ready. (${elapsed(startedAt)})`);
      return b;
    }),
  ]);
  if (serverResult.status === 'rejected' || browserResult.status === 'rejected') {
    await serverResult.value?.close();
    await browserResult.value?.close();
    throw serverResult.reason ?? browserResult.reason;
  }
  const server = serverResult.value;
  const browser = browserResult.value;

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 810 });

    // Set flag before page load and expose Reveal instance
    await page.evaluateOnNewDocument(() => { window.__screenshot__ = true; });
    await page.goto(server.resolvedUrls.local[0], { waitUntil: 'load' });
    await page.waitForFunction(() => window.__reveal__?.isReady());
    await page.addStyleTag({ content: NO_MOTION_CSS });
    console.log(`Page is ready. (${elapsed(startedAt)})`);

    // Get coordinates of all slides (including fragments) using Reveal API
    const { total, slides } = await page.evaluate(() => {
      const deck = window.__reveal__;
      const coords = [];
      const hSlides = deck.getHorizontalSlides();

      for (let h = 0; h < hSlides.length; h++) {
        const vSlides = hSlides[h].querySelectorAll(':scope > section');
        const verticalCount = vSlides.length || 1;

        for (let v = 0; v < verticalCount; v++) {
          const slide = vSlides.length ? vSlides[v] : hSlides[h];
          // Fragments sharing the same index appear together in one step
          const fragmentCount = new Set(
            [...slide.querySelectorAll('.fragment')].map((el) => el.dataset.fragmentIndex)
          ).size;

          coords.push({ x: h, y: vSlides.length ? v : 0, z: 0 });
          for (let f = 1; f <= fragmentCount; f++) {
            coords.push({ x: h, y: vSlides.length ? v : 0, z: f });
          }
        }
      }
      return { total: hSlides.length, slides: coords };
    });

    if (selected) {
      const outOfRange = [...selected].filter((h) => h >= total);
      if (outOfRange.length) {
        throw new Error(
          `Slide index out of range: ${outOfRange.join(', ')} (valid: 0-${total - 1})`
        );
      }
    }
    const targets = selected ? slides.filter(({ x }) => selected.has(x)) : slides;

    const SCREENSHOTS_DIR = makeTimestampDir();
    await mkdir(SCREENSHOTS_DIR, { recursive: true });
    console.log(`Output directory: ${SCREENSHOTS_DIR}`);
    console.log(`Capturing ${targets.length} of ${slides.length} slide state(s).`);

    const captureStart = performance.now();
    for (const { x, y, z } of targets) {
      // Navigate to the specified slide and fragment position using Reveal API
      // z=0 means no fragment state (Reveal API uses -1)
      await page.evaluate(({ x, y, z }) => {
        window.__reveal__.slide(x, y, z > 0 ? z - 1 : -1);
      }, { x, y, z });
      const warnings = await waitForSlideRendered(page);

      const filename = `slide-${x}-${y}-${z}.png`;
      await page.screenshot({
        path: resolve(SCREENSHOTS_DIR, filename),
        optimizeForSpeed: true,
        captureBeyondViewport: false,
      });
      console.log(`  Captured ${filename}`);
      for (const w of warnings) console.warn(`  WARNING (${filename}): ${w}`);
    }

    const captureSec = (performance.now() - captureStart) / 1000;
    const perState = targets.length ? (captureSec / targets.length) * 1000 : 0;
    console.log(
      `\nAll screenshots saved to ${SCREENSHOTS_DIR}` +
      `\nCapture: ${captureSec.toFixed(2)}s (${perState.toFixed(0)}ms/state), total: ${elapsed(startedAt)}`
    );
  } finally {
    await browser.close();
    await server.close();
    console.log('Server stopped.');
  }
}

takeScreenshots().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
