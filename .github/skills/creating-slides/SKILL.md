---
name: creating-slides
description: "Create and edit Reveal.js slide content using existing layouts. Use when: adding slides, writing slide HTML, inserting code blocks, Mermaid diagrams, KaTeX math, SVG diagrams, or fragments."
argument-hint: "Describe the slides you want to create or modify"
---

# Creating Slides

Write slide content in `src/slides.html` using the project's layout system. All slides are `<section>` elements inside `<div class="slides">`.

## Available Layouts

### Title slide — `layout-title`

```html
<section class="layout-title">
    <div class="layout-title__title">
        <h1>Presentation Title</h1>
    </div>
    <div class="layout-title__subtitle">
        <p>Subtitle, author name, date etc.</p>
    </div>
</section>
```

### Section divider — `layout-section`

```html
<section class="layout-section">
    <div class="layout-section__content">
        <div class="layout-section__number">&sect;1</div>
        <div class="layout-section__title"><h2>Section Title</h2></div>
    </div>
</section>
```

The `layout-section__number` element can be omitted if not needed.

### Content slide — `layout-content`

```html
<section class="layout-content">
    <div class="layout-content__title"><h2>Slide Title</h2></div>
    <div class="layout-content__body">
        <p>Body text, lists, code, diagrams, etc.</p>
    </div>
</section>
```

## Content Types

### Images

Use `<figure>` for photos or illustrations. Save images in `public/assets` and reference them with a path starting with `/assets/`:

```html
<figure>
    <img src="/assets/example.jpg" alt="Example image">
    <figcaption>Caption</figcaption>
</figure>
```

If the image is purely decorative, omit the `<figcaption>`.

### Code blocks

Always use `data-trim` and `data-noescape` on `<code>` for clean formatting:

```html
<pre><code class="language-python" data-trim data-noescape>
def hello():
    print("world")
</code></pre>
```

Set `class="language-XXX"` to the appropriate language for syntax highlighting.

### Mermaid diagrams

Prefer Mermaid for flowcharts, sequence diagrams, state machines, and other structured charts:

```html
<pre class="mermaid">
graph LR
    A --> B --> C
</pre>
```

Do NOT add a `<code>` wrapper for Mermaid. The `<pre class="mermaid">` element is rendered directly by the Mermaid plugin.

### KaTeX math

Use KaTeX for mathematical formulae. Inline math with `\(…\)`, display math with `\[…\]`:

```html
<p>The quadratic formula is \( x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} \)</p>
```

### SVG diagrams

Use inline `<svg>` for hand-drawn or custom diagrams. Keep the SVG self-contained within the slide body:

```html
<div class="layout-content__body">
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
        <!-- diagram content -->
    </svg>
</div>
```

### Fragments (incremental reveal)

Add `class="fragment"` to elements that should appear step-by-step:

```html
<ul>
    <li>Always visible</li>
    <li class="fragment">Appears on next click</li>
    <li class="fragment">Then this one</li>
</ul>
```

### Vertical slide stacks

Nest `<section>` elements for vertical navigation within a topic:

```html
<section>
    <section class="layout-content"><!-- slide 1 --></section>
    <section class="layout-content"><!-- slide 2 (down) --></section>
</section>
```

### Speaker notes

Add `<aside class="notes">` inside any `<section>` for presenter notes:

```html
<aside class="notes">Key talking points here.</aside>
```

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

Run `npm run screenshot` to capture all slide states, then visually review each screenshot. Check for:

- **Text overflow** — if text is clipped or runs outside a container, rephrase to be shorter or reduce font size.
- **Code overflow** — if a code block extends beyond the slide edge, break long lines or trim the example.
- **Syntax error** — if Mermaid or KaTeX fails to render, check the syntax and ensure the content is valid.
- **Diagram sizing** — if a Mermaid or SVG diagram is cut off, simplify it or adjust the `viewBox`/layout.
- **Fragment ordering** — step through each fragment state and confirm elements appear in the intended sequence.
- **Contrast and readability** — ensure text is legible against the slide background, especially on dark layouts.
- **Alignment** — verify titles, body text, and diagrams are visually balanced and not awkwardly positioned.

If anything looks off, fix the issue in `src/slides.html` and re-run `npm run screenshot` repeatedly until all issues are resolved.
