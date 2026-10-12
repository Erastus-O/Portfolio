# CLAUDE.md: Jesutofunmi Oluwatosin's portfolio

Read this file before you change anything. It is the brief for working on this codebase.

## What this is

This is the product-design portfolio of Jesutofunmi Oluwatosin, a product designer in the UK.

- The homepage is an interactive room scene. The centre is a **3D filing cabinet** built with three.js.
- Each drawer opens a section: Home, Projects, About me and Articles.
- A toy plane switches the scene between a **London** bedroom and a **Lagos** room.
- Room objects have small interactions: a dog, a TV, an Ayo board, a phone with a voice agent, a speaker, a gallery book, lamps and a CV folder.
- Pages render into `#pageView` from a hash router.

It is a **static site with no build step and no framework**. It is plain HTML, CSS and ES5 JavaScript loaded as classic `<script>` tags.

## Run it

```bash
npm run dev          # = npx serve . -l 5173
# or
python3 -m http.server 5173
```

Then open http://localhost:5173.

Serve the folder over HTTP rather than opening `index.html` as a file. Audio, the WebGL textures and the embedded prototype iframe need a real origin.

## Non-negotiable design rules

1. **Dark mode only.** `data-theme="dark"` is forced, `isDark()` returns `true` and the light theme was removed on purpose. Do not add a theme toggle.
2. **Inter Tight everywhere**, including canvas text. It is self-hosted in `fonts/` as variable woff2 files (weights 100 to 900, plus an italic). Do not add other typefaces or Google Fonts calls.
3. **Body text in case studies is justified** with hyphenation. `lang="en-GB"` sits on `.cs` and `.case-head`, so keep it there.
4. **British English** throughout.
5. **Draft markers.** Any text wrapped in `{curly braces}` is a draft or gap that Jesutofunmi has not approved.
   - `F()` turns `{...}` into `<span class="fill">…</span>`.
   - These spans are highlighted when "Review marks" (audit mode) is on.
   - When you write new content he has not supplied, wrap it in `{}` so he can audit it.
   - Remove the braces only when he confirms the text.
6. **Do not re-enable the Lagos street voices** (the Ṣọ́mọ́lú bus conductor and the "Tọ́funmi, lọ bá mi ra oúnjẹ wá" mum). `NGV` in `app.js` is dormant on purpose and never called.
7. **Privacy.**
   - Do not put personal phone numbers, bank account numbers or third parties' details in images or copy.
   - Blur them in screenshots, as `img/fundall/transfers.webp` already does.
   - The CV pages (`img/cv/`) are his own and stay as they are.
8. **Accessibility.**
   - Every interactive object is a real `<button>` or `<a>` with an `aria-label`.
   - Decorative SVG gets `aria-hidden`.
   - Respect `prefers-reduced-motion`; the code reads it into `reduce`.
   - When a page is open, `cabView` is set `inert`.
   - Keep all of this intact.

9. **Desktop only.** Phones and small touch screens see `#mgate` ("Best explored on a computer") instead of the site. It's shown by a media query in `styles.css` (max-width 899px, or a touch screen up to 1000px wide or under 500px tall), which hides `.wrap`. There's no "continue anyway" option, on purpose. The copy-link handler is at the end of `app.js`.

## File map

```
index.html            Markup: both room scenes (inline SVG), the cabinet stage, the header buttons, #pageView
src/styles.css        All styles (single file; sections are commented)
src/data/cases.js     CASES: the case-study content for each project, plus CS_IMG (named image lookups)
src/data/content.js   DRAWERS, INTRO, PROJECTS (index plus meta, linking to CASES[slug]) and ARTICLES
src/app.js            Everything else, in one IIFE (see the section map below)
vendor/three.min.js   three.js r128 (MIT), vendored so the site works offline
fonts/                Inter Tight variable woff2 files (normal and italic)
img/                  WebP images: aptap/, firstchekout/, fundall/, about/, cv/, gallery/, lagos/
audio/                Voice intros (London, Lagos) and the TV clip
proto/aptap/          Built Aptap prototype (Vite output, HashRouter, base "./"), embedded same-origin
```

**Script load order matters:** `three.min.js`, then `cases.js`, then `content.js`, then `app.js`. `content.js` reads `CASES` and `app.js` reads all the data globals.

### `src/app.js` section map (search for the `/* ====` and `/* ----` banners)

| Section | What it does |
|---|---|
| sound | `SFX`: all sound effects and ambience are synthesised with WebAudio, so there are no audio files for them. The mute choice is saved to localStorage under `jo-sound`. |
| bulb switch | `setLights()`: the lamps on and off, which also wakes Biscuit the dog |
| helpers | Isometric projection helpers (`P`, `poly`, `box`, `card`) |
| cabinet (three.js) | `build3d()`, `render3d()`, picking and hover, drag to turn (`turnBy`), drawer animation (`tick`) |
| pinned note | The intro card, plus the voice-intro player (`VOICES`, `vPlay`, waveform `BARS`) |
| pages | `F()`, `shell()`, `homePage`, `projectsPage`, **`projectPage`** (the case-study renderer), `aboutPage`, `articlesPage`, `articlePage` |
| router | `route()` runs on `hashchange`, and audit-mode toggling is here too |
| CV folder, gallery book, speaker, night city, dog, phone, OJ voice agent, plane, Lagos street, TV, footer email | Self-contained room interactions |

### Routes

| Hash | Page |
|---|---|
| (none) | Cabinet homepage |
| `#home` | Home page |
| `#projects` | Projects index |
| `#project-<slug>` | Case study |
| `#about` | About page |
| `#articles` | Articles index |
| `#article-<slug>` | Article |

The case-study table of contents uses `scrollIntoView` and never changes the hash. Changing the hash would re-route the page.

## Case-study data (`src/data/cases.js`)

Every case study follows the same **14-section structure**. It is defined in `CS_SECTIONS` in `app.js`, and the indices are 0-based:

| # | Index | Section | Data key(s) |
|---|---|---|---|
| 1 | 0 | Context | `product`, `constraints` (rendered in the meta grid), `stats` and `statsNote`, `heroImg` (or `hero` placeholder text) |
| 2 | 1 | Business problem | `business: [para, …]` |
| 3 | 2 | User problem | `user: [para, …]` |
| 4 | 3 | Evidence | `evidence: [[label, text], …]` |
| 5 | 4 | Known, assumed, unknown | `known: []`, `assumed: []`, `unknown: []` |
| 6 | 5 | Hypotheses | `hyp: [[belief, because?], …]`. The "Because" line shows only when `because` is set. |
| 7 | 6 | Exploration | `explore: [[title, text, "Method", "Chosen" or "Rejected"], …]`. The third value becomes the pill. |
| 8 | 7 | Decision rationale | `why: {user, business, technical}` |
| 9 | 8 | Design | `design: [[label, text, img?], …]`, `hideDesign: []`, `shotImgs: []`, `shotsInline` |
| 10 | 9 | Functional simulation | `sim`, `simUrl`, `simEmbed`, `simMode`, `simTitle` |
| 11 | 10 | Validation | `valid: {tested, happened, changed}` |
| 12 | 11 | Build collaboration | `build: [html string, …]`. Links are written inline as `<a href>`. |
| 13 | 12 | Outcome | `outcome: {measured, intended, hide: ["measured"]?}` |
| 14 | 13 | Learning | `learn: {next, taught}` |

### Per-case switches

- **`hideSections: [9, 11]`** removes whole sections by index. The TOC and the section numbers re-sequence automatically through `csNum(n)`.
- **`stats: [[value, label], …]`** gives the metric boxes. **`statsNote`** is the small line shown above them, e.g. "First month after release".
- **`heroImg: {src, w, h, alt, cap}`** is the hero image. `src` can be a path or a key in `CS_IMG`.
- **Design rows: `design: [[label, text, img?]]`.** The optional third item (one image object `{src,w,h,alt,cap}` or an array of them) puts those screenshots inside the row.
  - Rows sort by a fixed order list in `projectPage`; labels not in it, which is most custom names, keep their given order first.
  - Unless they are listed in **`hideDesign`**, the default rows (Flows, IA, UI, Interactions, States, Accessibility, Responsive) are auto-added as `{Add …}` placeholders.
  - All five current cases hide every default and use custom row names.
- **`shotImgs: []`** is a gallery under Design. **`shotsInline: true`** suppresses the gallery, because the images already sit in the design rows.
- **`secImgs: {sectionIndex: [img, …]}`** adds images at the end of any section. Fundall uses it for the persona, empathy map, HMW table and flows.
- **Simulation** has three modes:
  - **`simEmbed`**: a same-origin iframe. Aptap uses `proto/aptap/index.html#/`.
  - **`simMode: "link"` plus `simUrl`**: a "Launch prototype" card. Baci uses it, because that Expo app can't be bundled.
  - Otherwise `simUrl` is iframed directly. External iframes may be blocked by some hosts.
- **`outcome.hide: ["measured"]`** drops "Measured impact" for unlaunched or unmeasured work. Fundall and Aptap use it.

`PROJECTS` in `content.js` holds the card and header data (`name`, `org`, `kind`, `tags`, `summary`, `meta` rows). It links to its case with `cs: CASES[slug]`. Context meta always gets "Product" first and "Constraints" last.

## Current content status

| Case | Source | Notes |
|---|---|---|
| Firstchekout | erastus.design case study | Full. Intended measurement and "improve next" are drafts in `{}`. |
| Fundall | erastus.design case study | Sections 10 (Functional simulation) and 12 (Build collaboration) are hidden. Measured impact is hidden. Some Validation and Learning text is draft. |
| Aptap | Case-study docx, PRD and design prompt | Prototype embedded. The PRD defines a three-way test (Control, Variant A "Best Match", Variant B "Confidence & Clarity"). |
| Keys | erastus.design | User problem, hypotheses and some assumptions are drafts. |
| Baci | erastus.design | The prototype is a launch card to https://erastus-o.github.io/BACI/welcome |

Previously known inconsistencies now have **draft fixes in `{}` awaiting Jesutofunmi's approval**:

- **Aptap design rows**: the text was rewritten to describe what each screenshot shows (marketplace, deal results, deal details, compare, switch step 1).
- **Aptap Exploration and Decision rationale**: these now describe the PRD's three-way test (control, Variant A "Best Match", Variant B "Confidence & Clarity"). The six Hypotheses were left as they are.
- **Fundall "Wealth creation"**: the text now matches the screenshot (Regular Savings, Target Goals, Group Savings, naira/USD, Islamic zero-interest).
- **Fundall Exploration**: the chosen option now mentions the limited-access step before the BVN, which matches the updated flow image.

## Related repositories

- Aptap prototype source: https://github.com/Erastus-O/Aptap-Redesign. To update `proto/aptap/`, build it with Vite using `base: "./"` and HashRouter, then copy `dist/` over `proto/aptap/`.
- Baci prototype: https://github.com/Erastus-O/BACI (Expo; hosted on GitHub Pages)

## Working conventions

- Keep the code ES5-style (`var`, `function`), matching the existing files, unless you're asked to modernise.
- Add new images as **WebP**, sized for the web at about 1600px on the long edge. Put them in `img/<case>/` and always give `alt`, `w` and `h`.
- After changing a case study, check it at 1400px wide and at 390px (mobile).
  - There should be no horizontal overflow; `.cs-body` and `.cs-sec` use `minmax(0,1fr)` for this.
  - The TOC highlights the right section while you scroll (`csMark`).
  - Every image loads.
- Don't introduce a bundler or framework unless Jesutofunmi asks for one.
