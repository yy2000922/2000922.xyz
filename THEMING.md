# Theming Guide

This project uses a flexible, CSS variable-based theming system.

## Overview
- **Default Theme**: Dark Mode (Applied via `:root`).
- **Alternative Theme**: Light Mode (Applied via `[data-theme="light"]`).
- **Persistence**: User preference is saved in `localStorage` under the key `theme`.
- **Flicker Prevention**: An inline script in `<head>` applies the correct theme attribute before the body renders.

## Color Variables

The following CSS variables are defined in `src/assets/css/foundation.css`.

| Variable | Description | Dark (Default) | Light |
|----------|-------------|----------------|-------|
| `--bg-color` | Page background | `#0f0f0f` | `#fcfcfc` |
| `--text-primary` | Main text color | `#e0e0e0` | `#1a1a1a` |
| `--text-secondary` | Subtitle/muted text | `#a0a0a0` | `#666666` |
| `--accent-color` | Interactive accents | `#ffffff` | `#333333` |
| `--accent-subtle` | Borders/Dividers | `#333333` | `#e5e5e5` |
| `--glass-bg` | Frosted glass effect bg | `rgba(20, 20, 20, 0.8)` | `rgba(255, 255, 255, 0.8)` |
| `--nav-bg` | Navigation background | `rgba(15, 15, 15, 0.9)` | `rgba(252, 252, 252, 0.9)` |
| `--tile-bg-1` | Card background | `#1a1a1a` | `#f7f6f4` |

## How to Add New Variables

1. Add the variable to `:root` in `src/assets/css/foundation.css` with its Dark Mode value.
2. Add the variable to `[data-theme="light"]` in the same file with its Light Mode value.

## Usage in CSS

```css
.my-component {
    background-color: var(--bg-color);
    color: var(--text-primary);
    border: 1px solid var(--accent-subtle);
}
```

## JavaScript Logic

The theme logic is handled in two places:
1. **Initial Load** (`src/_includes/partials/head.njk`): An inline script checks `localStorage` and sets `data-theme` on `html`.
2. **Toggle** (`src/assets/js/main.js`): A click listener on `.theme-toggle` switches the attribute and updates `localStorage`.

## Testing

Run the logic test script:
```bash
node tests/theme-logic.test.js
```
