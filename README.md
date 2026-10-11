# Jesutofunmi Oluwatosin: Portfolio

An interactive product-design portfolio. The homepage is a 3D filing cabinet (three.js) in a London bedroom; fly the toy plane to Lagos. Each drawer opens a section: Home, Projects (five case studies), About me and Articles.

## Run locally

```bash
npm run dev            # or: python3 -m http.server 5173
```

Open http://localhost:5173. The site needs to be served over HTTP; don't open `index.html` straight from disk.

## Deploy

The site is fully static with no build step. Deploy the whole folder as-is to GitHub Pages, Netlify, Vercel or Cloudflare Pages.

## Editing

- **Case studies:** `src/data/cases.js`
- **Project cards, drawers, articles:** `src/data/content.js`
- **Styles:** `src/styles.css`
- **Behaviour:** `src/app.js`

See **CLAUDE.md** for the architecture, the case-study data schema and the design rules (dark mode only, Inter Tight, `{draft}` markers).

## Credits

three.js r128 (MIT) is in `vendor/`. Inter Tight (SIL Open Font License) is in `fonts/`.
