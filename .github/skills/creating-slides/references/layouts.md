# Available Layouts

This document describes the available slide layouts for creating slides. Each layout is defined in `src/layouts/`.

## Title slide — `layout-title`

Use the `layout-title` layout for the first slide of your presentation. It includes a title area and a subtitle area for additional information such as the author's name, date, or other details.

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

## Section divider — `layout-section`

Use the `layout-section` layout to divide your presentation into sections. The section number is optional and can be omitted if not needed.

```html
<section class="layout-section">
    <div class="layout-section__content">
        <div class="layout-section__number">&sect;1</div>
        <div class="layout-section__title"><h2>Section Title</h2></div>
    </div>
</section>
```

## Content slide — `layout-content`

Use the `layout-content` layout for regular content slides. This layout provides a title area and a body area for your content.

```html
<section class="layout-content">
    <div class="layout-content__title"><h2>Slide Title</h2></div>
    <div class="layout-content__body">
        <p>Body text, lists, code, diagrams, etc.</p>
    </div>
</section>
```
