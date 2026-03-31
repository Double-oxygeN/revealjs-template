---
description: "Use when editing, creating, or updating slide content, styles, or layouts. Ensures screenshots are taken after any slide changes."
applyTo: "src/**"
---
# Screenshots After Slide Changes

After modifying any file under `src/`, always take screenshots by running:

```sh
npm run screenshot
```

This captures every slide state (including fragment steps) into a timestamped folder under `screenshots/`.

After screenshots are taken, visually review each new screenshot using the image viewer to confirm the changes look as intended. If anything looks off, fix the issue and re-run screenshots.
