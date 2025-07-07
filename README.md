# Pixel Art Generator

A modern, web-based pixel art editor with full alpha (transparency) support, CSV/PNG import/export, and a mobile-friendly UI.

## Features

- **Customizable Grid:** Set width and height (1–50) for your pixel canvas.
- **Per-Pixel Transparency:** Each pixel supports alpha (opacity) from 0–255. Transparent pixels show a checkered background.
- **Color & Opacity Controls:**
  - Color picker for any color
  - Opacity slider (0–255) for alpha channel
  - Preset color swatches (opacity resets to 255 when selected)
- **Brush Size:** Adjustable brush size (1–10) with a slider.
- **Fill & Clear:**
  - Fill: Paint all pixels with the current color/opacity
  - Clear: Set all pixels to fully transparent
- **Import/Export:**
  - Export to CSV (compressed hex with alpha)
  - Import from CSV (supports 3, 4, 6, 8 digit hex)
  - Export to PNG (with transparency)
- **Responsive UI:**
  - Top navigation for grid/file controls
  - Bottom navigation for color, opacity, and brush controls
  - Mobile-friendly layout

## How It Works

- **Checkered Background:** Each pixel is wrapped in a div with a 2x2 checkered pattern, so transparency is always visible per pixel.
- **Painting:** Click or drag to paint with the selected color and opacity. Brush size is circular.
- **Color Format:** All color operations and exports use compressed hex with alpha (e.g., #f08c, #ff0088cc).

## Usage

1. Open `index.html` in your browser.
2. Set your grid size and click "Generate Grid".
3. Use the color picker, opacity slider, and brush size slider to paint.
4. Use the preset colors for quick selection (opacity resets to 255).
5. Export or import your art as CSV or PNG.

## File Structure

- `index.html` – Main UI
- `styles.css` – Responsive, modern styles
- `script.js` – All logic (grid, painting, import/export, color/alpha handling)

## License

MIT
