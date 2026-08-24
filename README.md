# Melvin Thoompunkal: Portfolio

Interactive portfolio for Melvin Thoompunkal: real-time data systems and applied AI. Visitors pick a path: a recruiter tour, a developer deep dive, or an in-browser playground with live demos.

Live at https://melvinthoompunkal.github.io/Website_Portfolio/

## Stack

- Hand-written HTML5, CSS3, and vanilla JavaScript. No frameworks, no build step, no CDN dependencies
- Self-hosted fonts (Space Grotesk, Inter Tight, JetBrains Mono) via Fontsource
- Inline SVG icons composed from stroke primitives
- Single amber accent on neutral graphite, dual themes (dark default)

## Structure

- `index.html` - landing with three persona paths plus the path sections
- `styles.css` - design tokens, dual themes, retro easter-egg theme, responsive layout
- `main.js` - hash router, scroll reveals, typewriter, parallax, counters, blockchain / stock / chat demos, Konami code
- `Melvin-Thoompunkal-Resume.pdf` - current resume download (stable filename: replace the file, links never change)

### Paths

1. **Recruiter** (`#recruiter`) - animated stat counters, highlights, project snapshot, one-click resume
2. **Developer** (`#developer`) - expandable project accordions with architecture flows and copyable code
3. **Playground** (`#playground`) - five browser demos: a mini God View earth (simulated events on a draggable wireframe globe), a mini Graft scan (animated chunk-to-agent-to-feature pipeline), a blockchain simulator with real hash chaining, a simulated stock tracker with sparkline, and a chat bot that knows the projects

Hidden extra: the classic cheat code does something.

## Local development

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
```

## Deployment

Push to `main` and GitHub Pages serves the repository root automatically.

## Accessibility

- WCAG AA contrast in both themes, visible focus states, reduced-motion support

## Contact

- Email: melvintthoompunkal@gmail.com
- LinkedIn: https://linkedin.com/in/melvin-thoompunkal/
- GitHub: https://github.com/melvinthoompunkal
