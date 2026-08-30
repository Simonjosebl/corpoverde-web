# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static marketing site (no build step, no dependencies, no package manager) for **Corporación Protectora Verde**, a Colombian NGO. Six hand-written HTML pages + two stylesheets + six scripts. Source content is in **Spanish** — keep copy, `es-CO` number formatting, and Spanish class/variable names consistent. English is produced at runtime by `js/i18n.js` (see below), never by duplicating pages.

## Running it

There is nothing to build, lint, or test. Serve the folder over HTTP (needed so `<video>` range requests and relative asset paths behave):

```powershell
python -m http.server 8000    # then open http://localhost:8000/index.html
# or
npx serve .
```

Opening `index.html` via `file://` mostly works but video autoplay and some fetch-adjacent behavior can differ.

Useful checks after a change:

```powershell
node --check js/app.js; node --check js/ui.js; node --check js/mapa.js; node --check js/i18n.js; node --check js/colombia-geo.js
```

## Architecture

### Pages and their shared chrome

`index.html`, `nosotros.html`, `programas.html`, `proyectos.html`, `alianzas.html`, `presentar-proyecto.html`.

The loader, scroll-progress bar, topbar, `<header id="header">` nav (with `.has-sub` mega-menus), `<aside id="drawer">` mobile menu, `.scrim`, footer, WhatsApp float and `#toTop` are **duplicated verbatim in all six pages**. There is no templating or include mechanism — a nav/footer change must be applied to every page by hand, or the pages drift out of sync. When adding a page, copy an existing page's chrome wholesale.

Script order at the bottom of every page:

```html
<script src="js/proyectos-data.js"></script>   <!-- solo donde hace falta -->
<script src="js/app.js" defer></script>
<script src="js/colombia-geo.js"></script>      <!-- solo programas.html -->
<script src="js/mapa.js" defer></script>       <!-- solo programas.html -->
<script src="js/ui.js" defer></script>
<script src="js/i18n.js" defer></script>
```

`i18n.js` must stay **last**: it translates whatever the other scripts have already painted, and re-translates later DOM insertions through a `MutationObserver`.

### `js/app.js` — base behaviours, one IIFE, every page

Loaded with `defer` and largely self-guarding (`if(!el) return`) — but **not all of it**:

- Unguarded, so these IDs must exist on every page: `#header`, `#burger`, `#drawer`, `#scrim`, `#toTop`, and `#year` (line 8 writes `textContent` with no null check — a missing `#year` throws and kills every later behavior in the file).
- Guarded/optional: contact form (`#contactForm`), sliders, `.vframe` videos, `.subnav`, `.eje`, `.pipe-tab`, projects table (`#pjBody`).

Behaviors in order: scroll shrink + back-to-top, drawer toggle, scroll-reveal (`.reveal` → `.in`), scrollspy for `.menu a`, hero count-up (`b[data-count]`), contact form, generic slider, video autoplay, sticky subnav spy, `.eje` tap-to-expand, pipeline tabs, projects table, pipeline deep-link from `location.hash`.

### `js/ui.js` — the 2026 redesign behaviours

Loaded after `app.js`; every block is a self-guarding IIFE, so the same file is safe on all six pages. Contains: page loader (`#loader`, with a 3.5 s safety timeout), reading-progress bar (`#progreso`), WhatsApp bubble (`#waFlota`, dismissal kept in `sessionStorage`), scroll parallax (`[data-parallax="0.12"]`), 3D card tilt (`[data-tilt]`), the video showcase (`#vshow`), the drag-and-scroll message carousel (`#msgWrap`), the accordion (`.acord-it`), animated figures (`[data-cifra]`, with `data-dec` / `data-pre` / `data-suf`) and background video autoplay (`video[data-fondo]`).

Everything respects `prefers-reduced-motion`.

### `js/colombia-geo.js` + `js/mapa.js` — choropleth map of areas of impact

`colombia-geo.js` is **generated, not hand-written**. It holds `window.COLOMBIA_DEPTOS` — one entry per department with `n` (name, matching `js/proyectos-data.js`), `c` (centroid inside the viewBox) and `d` (an SVG path) — plus `window.COLOMBIA_VIEWBOX` (`[640, 800]`) and `window.COLOMBIA_INSET` for the San Andrés archipelago, drawn in its own box so it does not stretch the mainland framing. It comes from a public GeoJSON of Colombia's 33 departments, simplified with Douglas-Peucker (0.012 degrees, ~3.700 points, 46 KB) and pre-projected (equirectangular with a cosine correction for the mean latitude). To regenerate it, rerun the conversion script; do not edit the paths by hand.

`mapa.js` mounts into `#mapaIncidencia` (currently `programas.html#incidencia`) and needs **both** `window.PROYECTOS` and `window.COLOMBIA_DEPTOS`, in that script order. It paints each department with an intensity proportional to the active metric (projects / beneficiaries / investment), using a sequential green ramp (`RAMPA`) and a square-root scale so one dominant department does not flatten the rest. Departments with no projects stay grey. It also renders the top-five labels — separated vertically with leader lines so the Caribbean cluster stays readable — plus the ranking list, the legend and the tooltip. `Cobertura nacional` records are excluded from the department count and reported separately.

If the projects table gains a department whose name does not match any `COLOMBIA_DEPTOS.n`, the map logs a `console.warn` naming it — that is almost always a typo in `proyectos-data.js`, not a missing geometry.

### `js/i18n.js` — Spanish → English at runtime

The site is authored in Spanish; English is a live translation. `DIC` maps the **exact Spanish string as it appears in the HTML** to its English equivalent. The engine walks text nodes and the `placeholder` / `title` / `aria-label` / `alt` attributes, keeps the originals in a `WeakMap` (so switching back is exact), skips `<script>`, `<style>`, `<textarea>`, `<svg>` and anything marked `data-no-traducir`, and re-runs on DOM insertions.

- **Adding copy to a page means adding its Spanish string to `DIC`.** Untranslated strings simply stay in Spanish.
- Headings split across `<span class="accent">` produce several short fragments — translate each so the English word order still reads correctly.
- Language choice: `?lang=en` / `#lang=en` wins, then `localStorage['cpv-idioma']`, then autodetect (Spanish if any `navigator.languages` entry starts with `es` **or** the timezone is `America/Bogota`; English otherwise).
- Switching fires a `cpv:idioma` event on `document`; `ui.js` listens to it to repaint the animated figures with the right locale and suffix.

Style convention across all scripts: ES5 (`var`, `function`, IIFEs), no build/transpile, Spanish comments. Match it.

### Reusable mechanisms

**Scroll reveal** — add `class="reveal"` plus a stagger class `d1`…`d5`; the observer adds `.in` once. Elements meant to show immediately (hero) are authored as `class="reveal in"`.

**Generic slider** — `initSlider(railId, prevId, nextId, dotsId)` at the bottom of app.js, wired to `progRail/progPrev/progNext/progDots` in `programas.html`. To add a carousel: emit a rail with children, prev/next buttons, an empty dots div, then call `initSlider` with the four IDs.

**Video showcase** (`programas.html#videos`) — `#vshow` holds one large `<video>` plus a `.vshow-rail` of `.vs-item` buttons carrying `data-src`, `data-poster`, `data-titulo`, `data-desc`. Selecting an item swaps the source in place. Playback is muted, looped and paused when off-screen.

**Almost every clip is shot vertically** (576x1024 or similar), so the featured frame is orientation-aware: on `loadedmetadata`, `ui.js` compares `videoHeight` to `videoWidth` and toggles `.vertical` on `.vshow-main`. In that mode the frame switches to a fixed height with `object-fit:contain` and a blurred copy of the poster (`.vs-fondo`) fills the sides, instead of cropping the subject out of a 16:9 box. Keep the overlays (`.vs-badge`, `.vs-mute`, `.vs-cap`) above the video in the stacking order.

**Section with a background video** (`index.html#contacto`) — mark the section `sec sec-dark sec-video` and put a `.sec-video-capa` holding a `<video data-fondo …>` plus a `.sv-velo` overlay as its first child. `ui.js` forces muted/looped/inline playback and pauses it off-screen. Cards, contact details and the form all get dark-glass variants under `.sec-video`. Pick a background clip with **no burnt-in text and no watermark**, and keep it small — the veil must stay dark enough that the form labels and placeholders remain legible.

**Pipeline tabs** (`proyectos.html`) — `.pipe-tab[data-panel="X"]` toggles `.active` on `#X.pipe-panel`. The panel IDs (`activados`, `estudio`, `viables`, `aprobados`, `financiados`, `ejecucion`, `supervision`, `ejecutados`, `informes`) double as hash anchors. Adding a pipeline state means touching the tab, the panel, the nav mega-menu and drawer groups on all six pages, and the footer.

**Projects table** — `js/proyectos-data.js` assigns `window.PROYECTOS`: **113 records** from the "Proyectos Activados Presentados Proteverde" sheet (28-ago-2026 cut), with fields `n, nombre, dep, mun, sector, ben, val, estado`; `ben`/`val` may be `null`, rendered as `—`; `estado` is `"Estudio"` or `"Registrado/Presentado"` and is rendered as a `.pj-estado` chip. It must be loaded **before** `app.js`. The renderer builds rows as an HTML string into `#pjBody` and supports search (`#pjSearch`), sector / estado / department / municipality filters (`#pjSector`, `#pjEstado`, `#pjDep`, `#pjMun`, options derived from the data) and click-to-sort on `thead th[data-key]`. Rows go in via `innerHTML`, so every text field passes through the local `esc()` helper — keep it that way for any new field.

The table is deliberately **not selectable or copyable** (`user-select:none` + `-webkit-touch-callout:none` on `table.pj`/`.pj-table-wrap`) and there is no export/download button — don't reintroduce one.

The `.pj-stats` figures above the table are hardcoded and must be kept in sync with the data: **113 records, 773.975 beneficiaries, $1,84 billones COP, 23 departments** (the same 23 figure also appears in the `.credenciales` band on `index.html`). Recompute with:

```powershell
node -e "global.window={};require('./js/proyectos-data.js');var p=window.PROYECTOS;console.log(p.length, p.reduce((a,b)=>a+(b.ben||0),0), p.reduce((a,b)=>a+(b.val||0),0))"
```

Note: the TOTAL row printed in the source PDF (435.240 / 1.688.862.756.919) does **not** sum every row — it omits rows 1–7 and the rows whose value was stored as text. The site uses the honest full sum, not the PDF's total.

**Project submission page** (`presentar-proyecto.html`) — five `.paso` cards (a `counter-reset:paso` grid; the dotted connector only shows at ≥1180px where the five fit on one row), six `.doc` download cards pointing at `docs/formatos/`, an eleven-item `.acord` guide to the official form, an FAQ accordion and the contact form.

`docs/formatos/` holds: the Corporation's own instructions (`Informacion-Proceso-Registro-Proyectos`), the blank submission form, the three SARLAFT documents, and `Ejemplo-Formulario-Diligenciado-Corpoteve.pdf`. That last one is **ours**: an HTML mock-up of the official form filled with a deliberately fictional project, printed to PDF with headless Chrome. It carries an "EJEMPLO" watermark and a disclaimer banner and must keep both — it exists to show the expected level of detail, never to pass as a real submission.

Per the official instructions, a complete submission also needs the project's **technical document** and **budget**, beyond the published forms. Keep the step cards, the "Adjunta" list and the `.aviso` box in sync with that list.

**Alliance cards** (`alianzas.html`) — `.allies-grid` is a 3×2 grid (2 cols ≤900px, 1 col ≤540px) of six `.ally` anchors: `.ally-tag` → `.ally-logo` (fixed 92px framed box; pick a `lg-w`/`lg-m`/`lg-bid`/`lg-t`/`lg-s` size class) → `.ally-name` → `.ally-role` → `.ally-link`. Keep six cards (or a multiple of three) or the last row goes ragged.

**Pillars band** (`index.html#enfoque`) — `.pilares-panel` holds a 4-up `.pilar` grid. `.pilar` carries `position:relative;z-index:1` on purpose: `.pilar-ic::before` is the conic-gradient ring at `z-index:-1`, and without that stacking context it would paint behind the panel background and vanish.

**Contact forms** — `#contactForm` never posts anywhere; it builds a `mailto:` URL to `corpoteverde@gmail.com` and sets `window.location.href`. `nosotros.html` (PQR) and `presentar-proyecto.html` reuse the same `#contactForm`/`#nombre`/`#email`/`#asunto`/`#mensaje` IDs, with `#asunto` as a `<select>`. Keep those IDs if you add another form.

**Back-to-top button** — `#toTop` is a small ring, not a boxed button: an SVG track plus a `.tt-avance` circle with `pathLength="100"` whose `stroke-dashoffset` `ui.js` drives from the scroll position, and a `.tt-flecha` arrow. It shares its scroll handler with the top `#progreso` bar. The arrow inherits `currentColor`; the original `styles.css` rule forced `stroke:#fff`, which made it invisible on the light button — do not reintroduce a fixed stroke colour.

**Videos** — `.vframe` wraps a `<video>` plus `.vposter` and `.vplay` overlay. app.js forces muted/loop/inline autoplay and hides the poster on success, restoring it if `play()` rejects. Assets live in `media/` with a matching `poster-*.jpg`.

### Stylesheets

`css/styles.css` — the original ~1000-line sheet, sectioned by `/* ====== NAME ====== */` banners. Design tokens live in its `:root`: Spanish-named brand colors (`--bosque`, `--lima`, `--azul`, `--hueso`, `--tinta`, `--niebla`, `--linea`), plus `--maxw`, `--rad`, `--shadow`, `--spring` and three font stacks (`--display` Bricolage Grotesque, `--serif` Fraunces, `--body` Instrument Sans, from Google Fonts in each page's `<head>`).

`css/rediseno.css` — loaded **after** it and wins on conflicts. It restyles the whole chrome and adds the redesign components. Sections are numbered 1–25; the tail holds correction patches, so put new fixes there. It adds its own tokens (`--crema`, `--linea-2`, `--sombra-card`, `--sombra-alta`, `--ease`, `--nav-h`) and a global `prefers-reduced-motion` block. Use the tokens rather than literal hex values.

**Never nest a comment inside a CSS comment.** CSS comments do not nest: the first closing marker ends the block and everything after it is parsed as CSS. A nested marker in this file's own header comment once swallowed the entire `:root` token block, which silently killed the footer background and every rule using `var(--linea-2)`, `var(--ease)` or `var(--sombra-card)`. Symptom to recognise: elements render transparent or lose their transitions while their text colours still apply. A quick scan for a `/*` appearing before the matching `*/` catches it.

**Section rhythm.** The page is one continuous light canvas (`body` carries the gradient; `.sec:not(.sec-dark)` is transparent) and dark sections are rounded, inset panels (`.sec-dark` with `margin-inline` + `border-radius` + shadow) instead of full-bleed bands. `.sec` and `.sec-dark` have the same specificity, so any new `.sec` background rule must exclude `.sec-dark` or it wipes the dark panels out.

**Divider motif.** Every dark panel opens with the same 3px animated gradient rule (`.sec-dark::before`), borrowed from the top edge of the "Cuatro pilares" card. It is what makes the jump from light canvas to dark block read as deliberate. `.divisor` is the standalone version, for separating blocks inside one section.

**Page closing.** Whatever the last section is, it must sit flush against the footer — a stray light strip between two dark blocks looks like a bug. `body > section.sec:last-of-type` trims the bottom padding, and `body > section.sec-dark:last-of-type` drops its radius and side margins and layers `linear-gradient(180deg, transparent 52%, var(--tinta-2))` over its own background so it dissolves into the footer colour. `index.html#contacto` additionally carries `.sec-cierre`, which does the same but keeps its background video: the veil gradient ends in `--tinta-2`. Verify with: gap between the last section's bottom and `.footer`'s top should be **0px** on every page.

Card families each have their own personality on purpose — `.pilar` (gradient border), `.prio` (numbered, expanding blob), `.card-foto` (zooming photo), `.card-glass` (glass on dark), plus the `.brillo` sweep and `[data-tilt]`. Reuse one of these instead of inventing a sixth.

### Assets

`img/asset-<hash>.{jpg,png}` are content-hashed originals — filenames are meaningless, so identify them by the `alt` text at their usage sites. Named files: `img/logo.png` (transparent RGBA, used for the header mark, the loader and the favicon — it is shown **without** any ring or circle wrapper anywhere: the logo is already circular, so the old `.brand .ring` and `.about-visual .ring-xl` frames are neutralised in `rediseno.css`), `img/hero.jpg`, `img/minambiente.png`, `img/comunidad-taller-{1,2,3}.jpg` (2026 community workshop photos).

`media/` holds the MP4s and their `poster-*.jpg` (each poster is a real frame pulled from its own clip with `ffmpeg -ss … -frames:v 1`, not a loose photo). The whole folder is ~42 MB.

**Web encoding profile.** These clips come from phones and are already heavily compressed, so CRF alone does not control the output size — encoding `comunidad-2026.mp4` at CRF 30 actually produced 47 MB, and `alianza-360.mp4` at CRF 28 came out *larger* than the original. Use **two-pass VBR with an explicit bitrate** when a target size matters:

```powershell
ffmpeg -i in.mp4 -vf "scale=360:-2:flags=lanczos,fps=24" -c:v libx264 -profile:v high -preset slow -b:v 320k -pass 1 -an -f mp4 NUL
ffmpeg -i in.mp4 -vf "scale=360:-2:flags=lanczos,fps=24" -c:v libx264 -profile:v high -preset slow -b:v 320k -pass 2 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 64k -ac 2 out.mp4
```

That took `comunidad-2026.mp4` from 69 MB to 15.9 MB (360x640, 24 fps, 391 kbps). 360 px wide is enough: the showcase never renders it above ~350 px. Always keep `+faststart` so playback can begin before the file finishes downloading. The untouched original lives outside the site folder, in `../corpoverde-video-original-2026-08-30/`.

`media/alianza-360.mp4` is **not** wired into the showcase: it carries another organization's branding ("Movimiento Misionero Mundial") and a CapCut watermark. The file is kept in case that association is deliberate, but do not put it back without checking.

`docs/formatos/` holds the four downloadable official forms; `docs/` also keeps the source spreadsheet and PDF of the project list.
