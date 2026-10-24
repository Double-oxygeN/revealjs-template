# Content Types

This document is a guideline for the various content types you can use in your slides.

## Cards / Panels

Use the `card` component for grouped content such as feature highlights, step-by-step instructions, or side-by-side comparisons. Wrap multiple cards in a `card-group` for horizontal layout:

```html
<div class="card-group card-group--primary">
    <div class="card">
        <h3>Card title</h3>
        <p>Card body text.</p>
    </div>
    <div class="card">
        <h3>Another card</h3>
        <p>More content here.</p>
    </div>
</div>
```

CSS variables for `card-group` classes:

- `--card-radius` — border radius for card corners (default: `0.75rem`)
- `--card-bg` — background color for cards (default: `var(--slide-primary-tint)`)
- `--card-min-width` — minimum width for each card in a group (default: `10rem`)

When the description text for each item is too long, consider using the `panel` component instead, which is optimized for longer text:

```html
<div class="panel-group panel-group--primary">
    <div class="panel">
        <figure>
            <img src="/assets/icon1.png" alt="Icon 1">
        </figure>
        <p>Panel body text.</p>
    </div>
    <div class="panel">
        <figure>
            <img src="/assets/icon2.png" alt="Icon 2">
        </figure>
        <p>More content here.</p>
    </div>
</div>
```

CSS variables for `panel-group` classes:

- `--panel-radius` — border radius for panel corners (default: `0`)
- `--panel-bg` — background color for panels (default: `var(--slide-primary-tint)`)

## Cycle rings

Use the `cycle-ring` component to show a cyclic process or a set of related items:

```html
<div class="cycle-ring" style="--ring-r: 200px; --ring-node-size: 200px;">
    <div class="cycle-ring__node" style="--a: 0deg;">Item 1</div>
    <div class="cycle-ring__node" style="--a: 120deg;">Item 2</div>
    <div class="cycle-ring__node" style="--a: 240deg;">Item 3</div>
</div>
```

The `data-autoarrow` attribute can be added to automatically draw arrows in clockwise direction between nodes. `data-autoarrow="ccw"` will draw arrows in counter-clockwise direction.

```html
<div class="cycle-ring" style="--ring-r: 200px; --ring-node-size: 200px;" data-autoarrow>
    <div class="cycle-ring__node" style="--a: -90deg;">Plan</div>
    <div class="cycle-ring__node" style="--a: 0deg;">Do</div>
    <div class="cycle-ring__node" style="--a: 90deg;">Check</div>
    <div class="cycle-ring__node" style="--a: 180deg;">Act</div>
</div>
```

CSS variables for `cycle-ring`:

- `--ring-r` — radius of the ring (default: `200px`)
- `--ring-node-size` — size of each node (default: `200px`)
- `--ring-node-bg` — background color for nodes (default: `var(--slide-primary-tint)`)
- `--ring-node-border` — border color for nodes (default: `var(--slide-primary)`)
- `--ring-node-color` — text color for nodes (default: `var(--slide-fg)`)
- `--ring-arrow` — color for auto-drawn arrows (default: `var(--slide-fg-dimmed)`)

CSS variables for `cycle-ring__node`:

- `--a` — angle for node position (required, e.g. `0deg`, `90deg`, etc.)

## Images

Use `<figure>` for photos or illustrations. Save images in `public/assets` and reference them with a path starting with `/assets/`:

```html
<figure>
    <img src="/assets/example.jpg" alt="Example image">
    <figcaption>Caption</figcaption>
</figure>
```

If the image is purely decorative, omit the `<figcaption>`.

## Code blocks

Always use `data-trim` and `data-noescape` on `<code>` for clean formatting:

```html
<pre><code class="language-python" data-trim data-noescape>
def hello():
    print("world")
</code></pre>
```

## Mermaid diagrams

Prefer Mermaid for flowcharts, sequence diagrams, state machines, and other structured charts:

```html
<pre class="mermaid">
graph LR
    A --> B --> C
</pre>
```

Do NOT add a `<code>` wrapper for Mermaid. The `<pre class="mermaid">` element is rendered directly by [Pele](https://pele.run), a Mermaid-compatible renderer.

Diagrams are styled automatically with the slide theme colors and font. Do NOT add `%%{init: ...}%%` theme settings or `style`/`classDef` color overrides unless a specific highlight is needed.

Diagrams are scaled up by `--mermaid-scale` (default `1.5`) and shrunk to fit when taller than the slide body. Adjust the scale per diagram when it looks too large or too small next to the surrounding content:

```html
<pre class="mermaid" style="--mermaid-scale: 1.2">
graph LR
    A --> B --> C
</pre>
```

Prefer `LR` over `TB` for flowcharts with many steps, since slides are wider than they are tall.

## KaTeX math

Use KaTeX for mathematical formulae. Inline math with `\(…\)`, display math with `\[…\]`:

```html
<p>The quadratic formula is \( x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} \)</p>
```

## SVG diagrams

Use inline `<svg>` for hand-drawn or custom diagrams. Keep the SVG self-contained within the slide body:

```html
<div class="layout-content__body">
    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
        <!-- diagram content -->
    </svg>
</div>
```

## Fragments (incremental reveal)

Add `class="fragment"` to elements that should appear step-by-step:

```html
<ul>
    <li>Always visible</li>
    <li class="fragment">Appears on next click</li>
    <li class="fragment">Then this one</li>
</ul>
```

## Vertical slide stacks

Nest `<section>` elements for vertical navigation within a topic:

```html
<section>
    <section class="layout-content"><!-- slide 1 --></section>
    <section class="layout-content"><!-- slide 2 (down) --></section>
</section>
```

## Speaker notes

Add `<aside class="notes">` inside any `<section>` for presenter notes:

```html
<aside class="notes">Key talking points here.</aside>
```
