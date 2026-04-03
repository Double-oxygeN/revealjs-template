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

import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer';

const ROOT = resolve(import.meta.dirname, '..');
const SERVER_URL = 'http://localhost:5173';

function makeTimestampDir() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const stamp =
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return resolve(ROOT, 'screenshots', stamp);
}

// Start Vite dev server and wait until it is ready
function startServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn('npx', ['vite', '--port', '5173', '--strictPort'], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const timeout = setTimeout(() => {
      reject(new Error('Server failed to start within 30 seconds'));
    }, 30_000);

    proc.stdout.on('data', (data) => {
      if (data.toString().includes('Local:')) {
        clearTimeout(timeout);
        resolve(proc);
      }
    });

    proc.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

function killServer(proc) {
  proc.kill('SIGTERM');
}

async function takeScreenshots() {
  const SCREENSHOTS_DIR = makeTimestampDir();
  await mkdir(SCREENSHOTS_DIR, { recursive: true });
  console.log(`Output directory: ${SCREENSHOTS_DIR}`);

  console.log('Starting Vite dev server...');
  const server = await startServer();
  console.log('Server is ready.');

  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 810 });

    // Set flag before page load and expose Reveal instance
    await page.evaluateOnNewDocument(() => { window.__screenshot__ = true; });
    await page.goto(SERVER_URL, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => window.__reveal__?.isReady());

    // Get coordinates of all slides (including fragments) using Reveal API
    const slides = await page.evaluate(() => {
      const deck = window.__reveal__;
      const coords = [];
      const hSlides = deck.getHorizontalSlides();

      for (let h = 0; h < hSlides.length; h++) {
        const vSlides = hSlides[h].querySelectorAll(':scope > section');
        const verticalCount = vSlides.length || 1;

        for (let v = 0; v < verticalCount; v++) {
          const slide = vSlides.length ? vSlides[v] : hSlides[h];
          const fragmentCount = slide.querySelectorAll('.fragment').length;

          coords.push({ x: h, y: vSlides.length ? v : 0, z: 0 });
          for (let f = 1; f <= fragmentCount; f++) {
            coords.push({ x: h, y: vSlides.length ? v : 0, z: f });
          }
        }
      }
      return coords;
    });

    console.log(`Found ${slides.length} slide state(s) to capture.`);

    for (const { x, y, z } of slides) {
      // Navigate to the specified slide and fragment position using Reveal API
      // z=0 means no fragment state (Reveal API uses -1)
      await page.evaluate(({ x, y, z }) => {
        window.__reveal__.slide(x, y, z > 0 ? z - 1 : -1);
      }, { x, y, z });
      await page.evaluate(() => new Promise((r) => setTimeout(r, 500)));

      const filename = `slide-${x}-${y}-${z}.png`;
      await page.screenshot({ path: resolve(SCREENSHOTS_DIR, filename) });
      console.log(`  Captured ${filename}`);
    }

    console.log(`\nAll screenshots saved to screenshots/`);
  } finally {
    if (browser) await browser.close();
    killServer(server);
    console.log('Server stopped.');
  }
}

takeScreenshots().catch((err) => {
  console.error(err);
  process.exit(1);
});
