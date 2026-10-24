---
name: creating-slides
description: "Create and edit Reveal.js slide content using existing layouts. Use when: adding slides, writing slide HTML, inserting code blocks, Mermaid diagrams, KaTeX math, SVG diagrams, or fragments."
argument-hint: "Describe the slides you want to create or modify"
---

# Creating Slides

Write slide content in `src/slides.html` using the project's layout system. All slides are `<section>` elements inside `<div class="slides">`.

## Available Layouts

See [Available Layouts](./references/layouts.md) for the predefined slide layouts you can use.

## Content Types

See [Content Types](./references/contents.md) for guidelines on adding various content types such as images, code blocks, Mermaid diagrams, KaTeX math etc.

## Rules

1. **Only edit `src/slides.html`** for slide content. Do not modify `index.html` or `src/index.js`.
2. **Always use a layout class** on each `<section>`. Never create bare unstyled slides.
3. **Prefer Mermaid** over ASCII art or images for charts and diagrams.
4. **Prefer KaTeX** for any mathematical notation.
5. **Prefer inline SVG** for custom/hand-drawn diagrams over raster images.
6. **Keep slides concise.** Use short phrases and bullet points, not paragraphs.

## Design Tokens

The color palette is defined in `src/layouts/tokens.css` via CSS custom properties. Do not hard-code colors — reference tokens if adding inline styles:

- `--slide-bg` / `--slide-fg` — background and foreground
- `--slide-primary` / `--slide-secondary` — accent colors
- `--slide-fg-body` / `--slide-fg-muted` / `--slide-fg-dimmed` — text variants

## After Making Changes

Capture screenshots of the slides you changed, then visually review each screenshot:

```sh
npm run screenshot -- 3 5-7   # only horizontal slides 3, 5, 6, 7 (all fragment states)
npm run screenshot            # all slides
```

- Indices are 0-based horizontal slide positions, matching `h` in the output filename `slide-h-v-f.png`.
- Inserting or deleting a slide shifts the indices of all following slides.
- Capture all slides (no arguments) after changing shared CSS/JS, and for the final check.

Check for:

- **Text overflow** — if text is clipped or runs outside a container, rephrase to be shorter or reduce font size.
- **Code overflow** — if a code block extends beyond the slide edge, break long lines or trim the example.
- **Syntax error** — if Mermaid or KaTeX fails to render, check the syntax and ensure the content is valid.
- **Diagram sizing** — if a Mermaid diagram is too small to read, simplify it, change its direction, or adjust `--mermaid-scale`; if an SVG diagram is cut off, adjust the `viewBox`/layout.
- **Fragment ordering** — step through each fragment state and confirm elements appear in the intended sequence.
- **Contrast and readability** — ensure text is legible against the slide background, especially on dark layouts.
- **Alignment** — verify titles, body text, and diagrams are visually balanced and not awkwardly positioned.

If anything looks off, fix the issue in `src/slides.html` and re-run `npm run screenshot -- <indices>` repeatedly until all issues are resolved.
