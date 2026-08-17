# Repository Guidelines

## Project Structure & Module Organization
This is a dependency-light, static Chinese-language web experience for the Song Tombs of Gongyi. Open `index.html` as the application entry point; it defines the screens, SVG map, controls, and script/style loading order. Keep presentation rules in `css/style.css`, application behavior in `js/main.js`, and tomb metadata in `js/data.js`. Image pairs for each tomb live in `assets/images/tombs/` and use the matching slug convention, for example `yongzhao_01.jpg`. The checked-in animation runtime is `vendor/gsap/gsap.min.js`; do not replace it with a CDN dependency.

## Build, Test, and Development Commands
There is no package manifest, build step, or automated test suite. Serve the repository root with a simple static server rather than relying on `file://` behavior:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. For every change, verify the intro transition, map dragging/zooming, marker selection, modal content/images, and the mobile layout in browser responsive mode. Check browser DevTools for JavaScript errors and missing asset requests.

## Coding Style & Naming Conventions
Follow the existing four-space indentation and semicolon-terminated JavaScript/CSS style. Prefer `const` for fixed bindings and camelCase for JavaScript functions and variables (`centerOnMarker`, `mapContainer`). Use kebab-case for CSS classes and IDs (`.btn-cinematic`, `#map-screen`), and group CSS by visual component with the existing section comments. Preserve Chinese UI copy and data-field names/shape in `tombsData`; add tomb IDs as lowercase slugs such as `yongtai` and keep their image filenames consistent.

## Testing Guidelines
Because tests are manual, exercise both mouse and touch interactions after edits. When changing `js/data.js`, confirm each `images` entry resolves under `assets/images/tombs/` and each `location` places a clickable SVG marker. When editing map transforms or GSAP behavior, test reset, wheel zoom, drag, and a no-animation fallback if the local GSAP file is unavailable.

## Commit & Pull Request Guidelines
No Git history is present in this checkout, so use concise imperative commit subjects, e.g. `Fix map marker centering`. Keep commits focused. Pull requests should explain the user-visible change, list manual checks performed, link any related issue, and include before/after screenshots or a short recording for visual or interaction changes.
