# Style Guidelines

This document defines how CSS is organized to keep styles scoped and maintainable.

## File responsibilities
- `src/assets/css/foundation.css`: design tokens, base elements, global resets.
- `src/assets/css/layout.css`: shared layout primitives (header, main, footer, global spacing).
- `src/assets/css/components.css`: reusable UI components shared by multiple pages.
- `src/assets/css/pages/*.css`: page-level styles scoped to a single page.

## Page-level styles
Use a dedicated file in `src/assets/css/pages/` when styles are only used by one page.

Example:
- `src/content/pages/services.njk` uses `/assets/css/pages/services.css`
- `src/content/pages/updates.njk` uses `/assets/css/pages/updates.css`

Add `pageStyles` in front matter so the base layout loads them:
```yaml
pageStyles:
  - /assets/css/pages/services.css
```

## Scoping and coupling
- Scope page-level selectors under a page container when possible (e.g. `.services-page-container`).
- Do not place page-only styles in `components.css`.
- Keep shared patterns in `components.css` only when used by 2+ pages.

## Inline styles
- Avoid inline styles in templates.
- If you must use them temporarily, move them into the page CSS in the next cleanup pass.

## Workflow checklist
1) Identify whether a style is page-only or shared.
2) Put page-only styles in `src/assets/css/pages/<page>.css`.
3) Add `pageStyles` in the page front matter (or layout).
4) Scope selectors to avoid leaking into other pages.
5) Verify there is no visual regression.
