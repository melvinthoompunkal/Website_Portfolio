# Melvin Thoompunkal - Portfolio

Personal portfolio for Melvin Thoompunkal: real-time data systems and applied AI. Built as a fast, dependency-free static site.

Live at https://melvinthoompunkal.github.io/Website_Portfolio/

## Stack

- Hand-written HTML5, CSS3, and vanilla JavaScript
- Self-hosted fonts (Space Grotesk, Inter Tight, JetBrains Mono) via Fontsource
- Inline SVG icons from Tabler Icons
- No frameworks, no build step, no CDN dependencies

## Structure

- `index.html` - single page: hero, about, experience, projects, skills, contact
- `styles.css` - design tokens, dual themes (dark default), responsive layout
- `main.js` - theme toggle, scroll reveals, nav highlighting, hero event-stream canvas
- `Melvin-Thoompunkal-Resume.pdf` - current resume download

## Local development

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
```

## Deployment

Push to `main` and GitHub Pages serves the repository root automatically.

## Accessibility and performance

- WCAG AA contrast in both themes, visible focus states, skip link, reduced-motion support
- Static assets only, self-hosted subset fonts, target Lighthouse 90+ on mobile

## Contact

- Email: melvintthoompunkal@gmail.com
- LinkedIn: https://linkedin.com/in/melvin-thoompunkal/
- GitHub: https://github.com/melvinthoompunkal
