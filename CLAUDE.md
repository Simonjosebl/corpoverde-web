# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static marketing site (no build step, no dependencies, no package manager) for **Corporación Protectora Verde**, a Colombian NGO. Seven hand-written HTML pages + two stylesheets + six scripts. Source content is in **Spanish** — keep copy, `es-CO` number formatting, and Spanish class/variable names consistent. English is produced at runtime by `js/i18n.js` (see below), never by duplicating pages.

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

`index.html`, `nosotros.html`, `programas.html`, `proyectos.html`, `mujeres.html`, `alianzas.html`, `presentar-proyecto.html`.

The loader, scroll-progress bar, topbar, `<header id="header">` nav (with `.has-sub` mega-menus), `<aside id="drawer">` mobile menu, `.scrim`, footer, WhatsApp float and `#toTop` are **duplicated verbatim in all seven pages**. There is no templating or include mechanism — a nav/footer change must be applied to every page by hand, or the pages drift out of sync. When adding a page, copy an existing page's chrome wholesale.

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

Loaded after `app.js`; every block is a self-guarding IIFE, so the same file is safe on all seven pages. Contains: page loader (`#loader`, with a 3.5 s safety timeout), reading-progress bar (`#progreso`), WhatsApp bubble (`#waFlota`, dismissal kept in `sessionStorage`), scroll parallax (`[data-parallax="0.12"]`), 3D card tilt (`[data-tilt]`), the video showcase (`#vshow`), the drag-and-scroll message carousel (`#msgWrap`), the accordion (`.acord-it`), animated figures (`[data-cifra]`, with `data-dec` / `data-pre` / `data-suf`) and background video autoplay (`video[data-fondo]`).

Everything respects `prefers-reduced-motion`.

### `js/colombia-geo.js` + `js/mapa.js` — choropleth map of areas of impact

`colombia-geo.js` is **generated, not hand-written**. It holds `window.COLOMBIA_DEPTOS` — one entry per department with `n` (name, matching `js/proyectos-data.js`), `c` (centroid inside the viewBox) and `d` (an SVG path) — plus `window.COLOMBIA_VIEWBOX` (`[640, 800]`) and `window.COLOMBIA_INSET` for the San Andrés archipelago, drawn in its own box so it does not stretch the mainland framing. It comes from a public GeoJSON of Colombia's 33 departments, simplified with Douglas-Peucker (0.012 degrees, ~3.700 points, 46 KB) and pre-projected (equirectangular with a cosine correction for the mean latitude). To regenerate it, rerun the conversion script; do not edit the paths by hand.

`mapa.js` mounts into `#mapaIncidencia` (currently `programas.html#incidencia`) and needs **both** `window.PROYECTOS` and `window.COLOMBIA_DEPTOS`, in that script order. It paints each department with an intensity proportional to the active metric (projects / beneficiaries / investment), using a sequential green ramp (`RAMPA`) and a square-root scale so one dominant department does not flatten the rest. Departments with no projects stay grey. It also renders the top-five labels — separated vertically with leader lines so the Caribbean cluster stays readable — plus the ranking list, the legend and the tooltip. `Cobertura nacional` records are excluded from the department count and reported separately.

**Rule: the map is never updated by hand, and it is never left behind.** Every figure it paints — the fill of each department, the top-five labels, the ranking, the legend and the "presencia en N departamentos" line — is derived from `window.PROYECTOS` at load time. There is no second copy of the numbers anywhere, so **any change to `js/proyectos-data.js` updates the map by itself**. Never hardcode a count, a department or a colour into `mapa.js` to "fix" a discrepancy: if the map disagrees with the table, the data file is the thing to look at.

After every cut of the projects sheet, check these two things and nothing else:

1. The map logs no `console.warn` (see below). A warning means a department name in the data does not match a geometry.
2. The highest department's count still spreads the ramp sensibly. The scale is a square root of `value / max` lifted by a floor (`PISO = 0.22` in `mapa.js`), so a department with a single project lands at roughly `rgb(45,156,84)` against a panel at `rgb(11,46,31)` and stays visible. Before that floor existed, one project rendered at `rgb(23,78,51)` and half the country looked empty on a phone. If a future cut has one department dwarfing the rest by an order of magnitude, raise the floor rather than flattening the ramp.

The legend bar samples the same `color()` function the map uses, floor included, so it cannot promise a shade no department actually has.

If the projects table gains a department whose name does not match any `COLOMBIA_DEPTOS.n`, the map logs a `console.warn` naming it — that is almost always a typo in `proyectos-data.js`, not a missing geometry.

### `js/i18n.js` — Spanish → English at runtime

The site is authored in Spanish; English is a live translation. `DIC` maps the **exact Spanish string as it appears in the HTML** to its English equivalent. The engine walks text nodes and the `placeholder` / `title` / `aria-label` / `alt` attributes, keeps the originals in a `WeakMap` (so switching back is exact), skips `<script>`, `<style>`, `<textarea>`, `<svg>` and anything marked `data-no-traducir`, and re-runs on DOM insertions.

- **Adding copy to a page means adding its Spanish string to `DIC`.** Untranslated strings simply stay in Spanish.
- Headings split across `<span class="accent">` produce several short fragments — translate each so the English word order still reads correctly.
- Language choice: `?lang=en` / `#lang=en` wins, then `localStorage['cpv-idioma']`, then autodetect (Spanish if any `navigator.languages` entry starts with `es` **or** the timezone is `America/Bogota`; English otherwise).
- Switching fires a `cpv:idioma` event on `document`; `ui.js` listens to it to repaint the animated figures with the right locale and suffix.

**Punctuation in the copy.** The interpunct (`·`) is banned from anything a visitor reads. It had spread through page titles, the topbar, the mega-menu CTA, the process phases and the map ranking, and it reads as machine-written filler. Use what Spanish already has: a comma for apposition (`Colombia, cobertura nacional`), a colon for a label (`Fase 1: presentación`), `y` for a pair, a pipe only in `<title>`. The same goes for the em dash used as a parenthesis (`—paso a paso—`) and for the "X, and not Y" flourish. When you add copy, add it without them.

Style convention across all scripts: ES5 (`var`, `function`, IIFEs), no build/transpile, Spanish comments. Match it.

### Reusable mechanisms

**Scroll reveal** — add `class="reveal"` plus a stagger class `d1`…`d5`; the observer adds `.in` once. Elements meant to show immediately (hero) are authored as `class="reveal in"`.

**Generic slider** — `initSlider(railId, prevId, nextId, dotsId)` at the bottom of app.js, wired to `progRail/progPrev/progNext/progDots` in `programas.html`. To add a carousel: emit a rail with children, prev/next buttons, an empty dots div, then call `initSlider` with the four IDs.

**Video showcase** (`programas.html#videos`) — `#vshow` holds one large `<video>` plus a `.vshow-rail` of `.vs-item` buttons carrying `data-src`, `data-poster`, `data-titulo`, `data-desc`. Selecting an item swaps the source in place. Playback is muted, looped and paused when off-screen.

**Almost every clip is shot vertically** (576x1024 or similar), so the featured frame is orientation-aware: on `loadedmetadata`, `ui.js` compares `videoHeight` to `videoWidth` and toggles `.vertical` on `.vshow-main`. In that mode the frame switches to a fixed height with `object-fit:contain` and a blurred copy of the poster (`.vs-fondo`) fills the sides, instead of cropping the subject out of a 16:9 box. Keep the overlays (`.vs-badge`, `.vs-mute`, `.vs-cap`) above the video in the stacking order.

**Section with a background video** (`index.html#contacto`) — mark the section `sec sec-dark sec-video` and put a `.sec-video-capa` holding a `<video data-fondo …>` plus a `.sv-velo` overlay as its first child. `ui.js` forces muted/looped/inline playback and pauses it off-screen. Cards, contact details and the form all get dark-glass variants under `.sec-video`. Pick a background clip with **no burnt-in text and no watermark**, and keep it small — the veil must stay dark enough that the form labels and placeholders remain legible.

**Pipeline tabs** (`proyectos.html`) — the nine stages of the project cycle. There is **one table**, and the tabs filter it; there is no separate per-stage layout and no state dropdown (both existed once and were redundant with each other).

Each tab carries three attributes:

- `data-panel` — which `.pipe-panel` to reveal. Stages **with data point at `activados`**, the panel that holds the stats, the toolbar and the table.
- `data-estado` — present only on stages backed by data. Its value is matched against `PROYECTOS[].estado`; the empty string means "no filter". `app.js` passes it to `window.CPV_PROYECTOS.filtrarEstado()`, which clears the other filters and re-renders.
- `data-ancla` — the hash this tab answers to (`proyectos.html#estudio` still works even though no `#estudio` element exists any more).

The four `.pj-stat` figures carry `data-pj="n|ben|val|dep"` and are **recomputed from the current filter**, so they can never contradict the table below them; the label of the first one (`data-pj-tx="n"`) changes with the view too. They describe the whole filtered selection, not the visible page — a figure that moved every time you turned a page would be useless. Below a billion the investment figure switches from *billones* to *mil millones* on its own. The `#pjVistaTit` / `#pjVistaSub` pair names the active view.

To give another stage real data: set the matching `estado` on the records in `proyectos-data.js`, then add `data-estado="<Estado>"` and `data-panel="activados"` to its tab and an entry to the `VISTAS` table in `app.js`. Delete its now-unused `.pipe-panel`. Stages left without `data-estado` keep showing their "coming soon" notice.

Adding a stage still means touching the tab, the nav mega-menu and drawer groups on all seven pages, and the footer.

**Projects table** — `js/proyectos-data.js` assigns `window.PROYECTOS`: **111 records** from the "Proyectos Activados Presentados Proteverde" sheet (7-oct-2026 cut), with fields `n, nombre, dep, mun, sector, ben, val, estado`; `ben`/`val` may be `null`, rendered as `—`; `estado` is `"Aprobados"`, `"Estudio"` or `"Registrado/Presentado"` and is rendered as a `.pj-estado` chip (`.apr` / `.est` / `.reg`). It must be loaded **before** `app.js`. The renderer builds rows as an HTML string into `#pjBody` and supports search (`#pjSearch`), sector / department / municipality filters (`#pjSector`, `#pjDep`, `#pjMun`, options derived from the data) and the stage filter driven by the pipeline tabs and click-to-sort on `thead th[data-key]`. Rows go in via `innerHTML`, so every text field passes through the local `esc()` helper — keep it that way for any new field.

**Pagination.** The table paints one page at a time. `#pjPager` (markup in `proyectos.html`, styles in CSS section 56, logic in the same `app.js` IIFE as the table) is a three-zone bar: how many pages on the left, the numbered buttons in the middle, the page size on the right.

- `porPagina` starts at 25 and comes from `#pjPorPagina`; the value `0` means "all".
- `ventana(pagina, paginas)` builds the number strip with at most seven slots — first, last, the current page and its neighbours, with `…` filling the gaps. Below eight pages every number is shown.
- `pagina` resets to 1 on **every** change of search, sector, department, municipality, sort order, page size and pipeline stage. Forgetting one of those leaves the visitor on a page that no longer exists.
- Turning a page scrolls back to the top of the table (`irArriba`), honouring `prefers-reduced-motion`.
- With no results the whole bar is hidden via the `hidden` attribute.

The left-hand line is the one piece of copy the runtime builds itself, so it carries `data-no-traducir` and is painted from the local `TEXTOS` table instead of `DIC`. It cannot read `window.CPV_I18N` on the first pass — i18n.js publishes that object at the end of its IIFE, *after* it has already applied the initial language — so the language comes from `e.detail.idioma` on the `cpv:idioma` event. Everything else in the bar (`Por página`, `Todos`, the aria-labels) is static HTML and lives in `DIC` like the rest.

The table is deliberately **not selectable or copyable** (`user-select:none` + `-webkit-touch-callout:none` on `table.pj`/`.pj-table-wrap`) and there is no export/download button — don't reintroduce one.

Figures repeated outside the data file must be kept in sync with it by hand. There are **five** places, and the last two are easy to miss because they are not `data-pj`:

| where | currently |
|---|---|
| `proyectos.html` `.pj-stats` (`data-pj`) | 111 / 763.195 / $1,77 billones / 22 |
| `index.html` `.credenciales` (`data-cifra`) | 111 projects, 22 departments |
| `index.html` hero `.hf-tx` (`data-cifra`) | 111 projects |
| `proyectos.html` `<meta name="description">` | 111 projects, $1,7 billones |
| `js/i18n.js` `DIC` | the `"$1,77 billones"` key | Recompute with:

```powershell
node -e "global.window={};require('./js/proyectos-data.js');var p=window.PROYECTOS;console.log(p.length, p.reduce((a,b)=>a+(b.ben||0),0), p.reduce((a,b)=>a+(b.val||0),0))"
```

Every cut of this sheet has arrived with the same handful of defects, and the site cleans them in `proyectos-data.js` rather than reproducing them. For the 7-oct-2026 cut:

- Its TOTAL row (404.420 / 1.590.235.295.547) does **not** sum every row. The site publishes the honest full sum instead.
- Row 92 is blank and the last row repeats the number 112, so the 112 data lines are renumbered 1–111 after one removal.
- Against the 28-sep cut this one changes only three things: the Piedecuesta wastewater plant moves to `Aprobados` and rises to $52.373.728.632, the Santiago de Tolú drug-prevention project rises to $2.511.310.750, and one record is new — the nationwide **entrepreneurship strategy for female heads of household** (1.000 beneficiaries, $2.500.000.000, `Aprobados`), which is what `mujeres.html` is built around. Row numbers shifted because the sheet groups the approved ones first.
- The Chaparral market-hall project is listed **twice**, identically, at rows 2 and 52 (`Aprobados`, 54.809 beneficiaries, $14.099.621.857). Only one is published.
- Department and municipality are swapped in four rows, and one row has no department at all. Four more name a department in the project title that contradicts the department column (Boyacá, Boyacá, Magdalena, Norte de Santander); the title wins.
- Spelling in the source is inconsistent (`PLAN MESTRO`, `MPLEMENTACION`, `Eduactiva`, `HIDIRCA`, `Granadas`, `Sopetran`, `Puerto Escindido`, `OCRHOMA`). Names are published corrected.
- Two pairs of rows share a name but differ in beneficiaries (the Beltrán tomato project, 622 and 1.291; the Acacías fish-farming project, 410 and 810). They are separate registrations and both stay.

Two figures in this cut look like copy-paste slips in the source rather than real numbers, and are published as they came: Santa Rosalía's sewer plan carries the same value as the Chaparral market hall ($14.099.621.857), and its beneficiaries went from 400 to 2.400. Worth raising with the Corporation before the next cut.

**Project submission page** (`presentar-proyecto.html`) — in order: three `.paso` cards, one per **official phase** (`#como`), the nine-step **official diagram** (`#flujo`), six `.doc` download cards pointing at `docs/formatos/` (`#formatos`), an eleven-item `.acord` guide to the official form (`#guia`), an FAQ accordion and the contact form.

The phases and the nine steps both come from `docs/formatos/Informacion-Proceso-Registro-Proyectos-Corpoteve.pdf` — the phases from its text, the steps from the "Diagrama de proceso de presentación, evaluación y ejecución de proyectos" image embedded in it. **The diagram is republished as HTML (`.flujo`, CSS section 54), not as that JPEG**, so it stays responsive, translatable through `DIC` and readable by a screen reader; the PDF itself is offered for download at the foot of the section. If the Corporation revises the diagram, update the `PASOS`/`GRUPOS` tables that generated the markup and the matching `DIC` keys — do not paste the image in.

The earlier five `.paso` cards were ours, not the Corporation's; they were replaced by the three real phases.

`docs/formatos/` holds: the Corporation's own instructions (`Informacion-Proceso-Registro-Proyectos`), the blank submission form, the three SARLAFT documents, and `Ejemplo-Formulario-Diligenciado-Corpoteve.pdf`. That last one is **ours**: an HTML mock-up of the official form filled with a deliberately fictional project, printed to PDF with headless Chrome. It carries an "EJEMPLO" watermark and a disclaimer banner and must keep both — it exists to show the expected level of detail, never to pass as a real submission.

Per the official instructions, a complete submission also needs the project's **technical document** and **budget**, beyond the published forms. Keep the step cards, the "Adjunta" list and the `.aviso` box in sync with that list.

**Women in business page** (`mujeres.html`) — the Corporation's route for women entrepreneurs, built around the nationwide entrepreneurship strategy that entered the project table as approved. In order: a `#prioridad` band (a `.sec-dark` panel with three figures and the `.mj-nota` callout), `#apoyo` (four `.pilar` cards), `#como` (four `.paso` cards), `#inscribirse` (the registration form on a `.sec-foto` photo section) and `#faq`.

`#prioridad` is **`sec sec-dark`, not `sec-panel-verde`**. That second class looks like it should be the dark green one and is in fact a *pale* green-to-blue gradient; white figures on it are invisible. If a band needs white text, it needs `.sec-dark`.

The registration form is `#formMujeres`, the only form on the site that is not `#contactForm`. It has thirteen fields across three `fieldset`s plus six `input[name="apoyo"]` checkboxes and a required data-consent box. Its handler lives at the bottom of `js/app.js` and, like the others, posts nowhere: it assembles a plain-text body with the fields in labelled sections and opens a `mailto:` to corpoteverde@gmail.com. Field ids are read one by one, so **renaming an id in the HTML silently drops that field from the email** — keep the two in step.

`presentar-proyecto.html` points at this route from a `.mj-ruta` band under its three phase cards.

Its `<select>`s use the generic `.field select` rule added for this page, which mirrors `.field input` (same padding, border and radius) and has a dark-glass variant under `.sec-foto`. Before it existed, only selects carrying `.pj-select` were styled on dark sections and a bare `<select>` fell back to the native widget.

**Alliance cards** (`alianzas.html#alianzas`) — `.allies-grid` is a 3-column grid (2 cols ≤900px, 1 col ≤540px) of `.ally` anchors: `.ally-tag` → `.ally-logo` (fixed 92px framed box; pick a `lg-w`/`lg-m`/`lg-bid`/`lg-t`/`lg-s` size class) → `.ally-name` → `.ally-role` → `.ally-link`.

It holds **ten** entities in one list: the cooperation and institutional allies, and the organisations that actually deliver the approved projects (from the "Relación proyectos por empresas ejecutoras" sheet). They were two separate sections once, which meant Ingeambiental and 360 Group appeared twice on the same page; now each entity appears once and `.ally-tag` says which it is, with `.es-ejec` turning the tag green for anyone who delivers.

Ten is not a multiple of three, so the orphan in the last row is centred by `:nth-last-child(1):nth-child(3n+1){grid-column:2}` rather than left hanging. Keep that rule in mind when the count changes.

All ten now carry a logo. Eight came from their owners: `img/pies-descalzos.png` (rasterised at 392px from the foundation's own SVG), `img/casa-didactico.png` (from the company's site), `img/gea.png` (supplied by the Corporation, cropped to its bounding box with the white matte turned transparent) and the five already in the repo.

**`img/funcredes.png` is ours, not theirs.** No site, logo or registry record for Fundación Funcredes could be found, so the Corporation asked for a mark to be drawn. It is a wordmark in the site's own display face with a three-figure seal and a wave for the gulf of Morrosquillo, built from `scratchpad/funcredes.html` and rasterised. Treat it as a placeholder: **swap it the moment the foundation sends its real mark**, and do not present it anywhere as the foundation's registered identity.

The supplied GEA file reads **"GEA Colombia S.A.S."** while the delivery sheet names the contractor **"Grupo Empresarial GEA S.A.S."**. The card keeps the sheet's legal name because that is the authoritative source for the contract, but the two should be reconciled.

`.ally-mono` is kept in the stylesheet even though nothing uses it now: it is the fallback for a future ally whose logo we cannot obtain, and it is a better answer than a borrowed or invented mark.

The section sits on `sec-panel sec-panel-verde` on purpose. White cards on the page's own near-white canvas had nothing to stand against; the tinted panel is what gives them an edge. CSS section 59 adds the rest of the relief: a permanent gradient rule along the top of each card (it used to appear only on hover), a deeper shadow, an inner ring and a hover glow on the logo frame, and a light sweep across the card. The logo frame stays light whatever the section does, because most of these marks are dark ink.

The footer logo marquee mirrors this list and is duplicated twice per track for the loop, so adding a logo there means two insertions per marquee, on all seven pages.

**Two rows of the delivery sheet are deliberately not published**: Fundación Escala (ecological restoration in Córdoba, $30.000.000.000) and Fundación Claudia T. (the women's entrepreneurship strategy, $2.500.000.000). Both are marked PENDIENTE with 0 months, so there is no contract to announce.

**No NIT and no amounts are published.** The sheet gives Fundación Pies Descalzos two different NITs (802016680-8 and 900952420-1), and the second is 360 Group's own number in another row; 360 Group itself appears with two more. Until the Corporation confirms which is which, a tax ID on a public page is a liability rather than transparency. Timeframes and values were on the cards briefly and were removed: the portfolio page is where figures belong.

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

`img/asset-<hash>.{jpg,png}` are content-hashed originals — filenames are meaningless, so identify them by the `alt` text at their usage sites. Named files: `img/hero.jpg`, `img/minambiente.png`, `img/proyectos-360.png` (a partner's logo, not ours), `img/comunidad-taller-{1,2,3}.jpg` (2026 community workshop photos).

From the 7-sep-2026 field material: `img/escuela-rural.jpg`, `img/asamblea-comunidad.jpg`, `img/olla-comunitaria.jpg`, `img/ninez-materiales.jpg`, `img/encuentro-comunidad.jpg`, `img/ninas-jornada.jpg` and `img/jornada-plaza.jpg` (the only portrait one, used as the `.imp.tall` tile). Phone originals are 4032 px wide and 1,5–2,8 MB; they are published at 1280 px / `-q:v 5` (~220–370 KB), except the portrait one at 910 px. From the 4 and 5-oct-2026 batch: `img/cartilla-ninez.jpg`, `img/lectura-ninez.jpg`, `img/alfabetizacion-taller.jpg` and `img/maloca-noche.jpg` (all portrait, so they go in as `.imp.tall`), plus `img/cosecha-mojojoy.jpg` and `img/lavado-rio.jpg` (close-ups that survive the horizontal crop of `.imp.wide`).

The `.impact-grid` on `programas.html` now tiles **18** figures and the one on `index.html` **7** — both sets tile the 12-column grid exactly, so adding or removing one figure means re-checking the spans (`big` 6×2, `tall` 3×2, `wide` 6, `sq` 3) or the last row goes ragged.

**Photos of women.** `mujeres.html` draws on the four usable ones in the catalogue: `img/asset-db77e87d23.jpg` (two women in a carpentry workshop, the strongest "emprendimiento" image we have), `img/comunidad-taller-3.jpg`, `img/asset-918455482d.jpg` and `img/alfabetizacion-taller.jpg`, all portrait and all tiled as `.imp.tall` in its `#ellas` grid. `img/asset-1545147a2e.jpg` sits behind the `#prioridad` veil and `img/asset-51b1224baf.jpg` behind the registration form.

Two other photos of women are **not** used there because they carry another organization's branding, the same problem as `media/alianza-360.mp4`:

- `img/asset-e84c724c6a.jpg` shows a UNICEF vest and cooler box. It is still published on `programas.html` as the "Salud y Bienestar" programme card, where it reads as the Corporation's own work. Worth checking with the Corporation.
- `img/asset-55a8e5073f.jpg` carries a "La Concordia" watermark. It is not used anywhere.

**The logo** (September 2026 onwards) is the circular CPV emblem — dark green and gold, "CORPORACIÓN PROTECTORA VERDE · PROTECCIÓN AMBIENTAL · EST. 2001". It ships in two files:

| file | size | used by |
|---|---|---|
| `img/logo.webp` | 512x512, q90, 98 KB | every `<img>`: header, loader, drawer, footer, "Quiénes somos" |
| `img/logo.png` | 128x128, 41 KB | the `<link rel="icon">` favicon only |

**WebP is deliberate**: the emblem is a photorealistic seal full of gradients, so PNG compresses it badly — the same 512px frame is 539 KB as PNG against 98 KB as WebP. The favicon stays PNG because WebP favicon support is still uneven. The 4096px master is archived outside the site, in `../corpoverde-backup-2026-08-30/CPV_LOGO_NUEVO-master-4096.png`; regenerate the web files from it with:

```powershell
ffmpeg -i master.png -vf "scale=512:512:flags=lanczos" -c:v libwebp -quality 90 -compression_level 6 -preset picture img/logo.webp
ffmpeg -i master.png -vf "scale=128:128:flags=lanczos" -pix_fmt rgba img/logo.png
```

The logo is shown **without any ring or circle wrapper** — it is already circular, so the old `.brand .ring` and `.about-visual .ring-xl` frames are neutralised in `rediseno.css`. Its interior is dark green, so on the site's own green surfaces (loader, drawer, footer) it needs the halo in section 52 of `rediseno.css` to detach from the background; on light surfaces a plain soft shadow is enough. Do not swap the halo for a solid disc or a box.

Both logo files are covered by the cache-busting `?v=` hash, so a redesign of the mark cannot be served stale.

`media/` holds the MP4s and their `poster-*.jpg` (each poster is a real frame pulled from its own clip with `ffmpeg -ss … -frames:v 1`, not a loose photo). The whole folder is ~47 MB.

The showcase rail holds fourteen pieces. It opens with `tejido-social.mp4` (7-oct-2026, the community raising a roof frame together), then `amazonia-aerea.mp4` and `selva-amazonia.mp4` from the 5-oct batch. Those three carry the Corporation's own burnt-in branding ("Unidos por la Amazonía", "Juntos construimos tejido social"), which is why they lead, followed by `taller-cartilla.mp4` and `vivienda-comunidad.mp4` from the same days and then the 7-sep batch (`recreacion-campo.mp4`, `integracion-comunidad.mp4`, `taller-ninez.mp4`). The `poster=` hardcoded on `.vshow-main video` must match the **first** `.vs-item` (`ui.js` selects it on load). The first two are landscape at 720 px, the third is vertical at 360×640 and exercises the `.vertical` branch of the frame.

**Web encoding profile.** These clips come from phones and are already heavily compressed, so CRF alone does not control the output size — encoding `comunidad-2026.mp4` at CRF 30 actually produced 47 MB, and `alianza-360.mp4` at CRF 28 came out *larger* than the original. Use **two-pass VBR with an explicit bitrate** when a target size matters:

```powershell
ffmpeg -i in.mp4 -vf "scale=360:-2:flags=lanczos,fps=24" -c:v libx264 -profile:v high -preset slow -b:v 320k -pass 1 -an -f mp4 NUL
ffmpeg -i in.mp4 -vf "scale=360:-2:flags=lanczos,fps=24" -c:v libx264 -profile:v high -preset slow -b:v 320k -pass 2 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 64k -ac 2 out.mp4
```

That took `comunidad-2026.mp4` from 69 MB to 15.9 MB (360x640, 24 fps, 391 kbps). 360 px wide is enough: the showcase never renders it above ~350 px. Always keep `+faststart` so playback can begin before the file finishes downloading. The untouched original lives outside the site folder, in `../corpoverde-video-original-2026-08-30/`.

`media/alianza-360.mp4` is **not** wired into the showcase: it carries another organization's branding ("Movimiento Misionero Mundial") and a CapCut watermark. The file is kept in case that association is deliberate, but do not put it back without checking.

`docs/formatos/` holds the downloadable official forms; `docs/` also keeps the source spreadsheet and PDF of the project list, plus `Brochure-Institucional-Corpoteve-2026.pdf`.

**The brochure** is the Corporation's own 7-page institutional presentation (identity, purpose, ten strategic axes, programmes, portfolio, how to take part). It is linked from the `#brochure` band on `nosotros.html` (CSS section 55) and from the "Navegación" column of the footer on all seven pages. Its cover is an **AI-generated illustration** and the PDF says so on the page — that is why the band draws a CSS "cover" instead of lifting the image out of the document.

It arrived at 8,7 MB because its cover was embedded as a 2048×2048 *lossless* Flate bitmap (7,8 MB on its own). Recompressing that single stream as JPEG and rebuilding the xref took the file to **1,5 MB** with no other change; the untouched original is outside the site folder. Page 6 of the brochure quotes the portfolio figures as of 9-sep-2026 (113 / 773.975 / $1,84 billones / 23), one cut behind the table now published — worth telling the Corporation before they hand it out.
