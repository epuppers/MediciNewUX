# Cosimo — Applied Intelligence Platform

Interactive UI demo for Cosimo, a finance-focused AI assistant with chat and workflow automation views.

## Running

Open `index.html` in a browser, or serve locally:

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Structure

```
├── index.html           # Main entry point
├── css/
│   ├── tokens.css       # Design tokens, variables, reset
│   ├── layout.css       # App frame, sidebar, main content
│   ├── chat.css         # Chat view, messages, artifacts
│   ├── workflows.css    # Workflow listing, detail, tabs
│   ├── components.css   # Steps, runs, cosimo panel
│   └── utilities.css    # Dropdowns, grid, scrollbars, overlay
├── js/
│   └── app.js           # Application logic
└── README.md
```

## Fonts

Uses Google Fonts (loaded via CDN):
- **VT323** — Pixel/display headings
- **IBM Plex Mono** — UI labels, code, data
- **DM Sans** — Body text
