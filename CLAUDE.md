# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static marketing site (no build step, no dependencies, no package manager) for **Corporación Protectora Verde**, a Colombian NGO. Five hand-written HTML pages + one shared stylesheet + one shared script. All content is in **Spanish** — keep copy, `lang="es"`, and `es-CO` number formatting consistent.

## Running it

There is nothing to build, lint, or test. Serve the folder over HTTP (needed so `<video>` range requests and relative asset paths behave):

```powershell
python -m http.server 8000    # then open http://localhost:8000/index.html
# or
npx serve .
```

Opening `index.html` via `file://` mostly works but video autoplay and some fetch-adjacent behavior can differ.

## Architecture

### Pages and their shared chrome

`index.html`, `nosotros.html`, `programas.html`, `proyectos.html`, `alianzas.html`.

The topbar, `<header id="header">` nav (with `.has-sub` dropdowns), `<aside id="drawer">` mobile menu, `.scrim`, footer, WhatsApp float, and `#toTop` button are **duplicated verbatim in all five pages**. There is no templating or include mechanism — a nav/footer change must be applied to every page by hand, or the pages drift out of sync. When adding a page, copy an existing page's chrome wholesale.

### `js/app.js` — one IIFE, every page

A single script drives every page. It is loaded with `defer` at the bottom of each page and its behaviors are largely self-guarding (`if(!el) return`) — but **not all of them**:

- Unguarded, so these IDs must exist on every page: `#header`, `#burger`, `#drawer`, `#scrim`, `#toTop`, and `#year` (line 8 writes `textContent` with no null check — a missing `#year` throws and kills every later behavior in the file).
- Guarded/optional, activate only where their markup exists: contact form (`#contactForm`), sliders, `.vframe` videos, `.subnav`, `.eje`, `.pipe-tab`, projects table (`#pjBody`).

Behaviors in the file, in order: scroll shrink + back-to-top, drawer toggle, `IntersectionObserver` scroll-reveal (`.reveal` → `.in`), scrollspy for `.menu a`, hero count-up (`b[data-count]`), contact form, generic slider, video autoplay, sticky subnav spy, `.eje` tap-to-expand, pipeline tabs, projects table, pipeline deep-link from `location.hash`.

Style convention: ES5 (`var`, `function`, IIFEs), no build/transpile, Spanish comments. Match it.

### Reusable mechanisms

**Scroll reveal** — add `class="reveal"` plus a stagger class `d1`…`d5`; the observer adds `.in` once. Elements meant to show immediately (hero) are authored as `class="reveal in"`.

**Generic slider** — `initSlider(railId, prevId, nextId, dotsId)` at the bottom of app.js. Currently wired to two instances in `programas.html`: `progRail/progPrev/progNext/progDots` and `vRail/vPrev/vNext/vDots`. It reads card width + CSS `gap` from the DOM, computes stops from `perView()`, snaps the last stop to exact `maxScroll()`, rebuilds dots on resize. To add a carousel: emit a rail with children, prev/next buttons, an empty dots div, then call `initSlider` with the four IDs.

**Pipeline tabs** (`proyectos.html`) — `.pipe-tab[data-panel="X"]` toggles `.active` on `#X.pipe-panel`. The panel IDs (`activados`, `estudio`, `viables`, `aprobados`, `financiados`, `ejecucion`, `supervision`, `ejecutados`, `informes`) double as hash anchors: nav/footer links like `proyectos.html#financiados` open the matching tab via the `hashchange` handler. Adding a pipeline state means touching the tab, the panel, the nav submenus and drawer groups on all five pages, and the footer.

**Projects table** — `js/proyectos-data.js` assigns `window.PROYECTOS` (112 records: `n, nombre, dep, mun, sector, ben, val`; `ben`/`val` may be `null`, rendered as `—`). It must be loaded **before** `app.js` (see the script order in `proyectos.html`). The renderer builds rows as an HTML string into `#pjBody` and supports search (`#pjSearch`), sector filter (`#pjSector`, options derived from the data), and click-to-sort on `thead th[data-key]`. Currency/counts use `toLocaleString('es-CO')`. Because rows are injected via `innerHTML`, any new field must be escaped or known-safe.

The table is deliberately **not selectable or copyable** (`user-select:none` + `-webkit-touch-callout:none` on `table.pj`/`.pj-table-wrap`) and there is no export/download button — don't reintroduce one. The `.badge` sector chip is dark green with warm-yellow text. The `.pj-stats` figures above the table are hardcoded and must be kept in sync with the data: 112 records, 441.550 beneficiaries, $1,82 billones COP (recompute by summing `ben`/`val` if records change).

**Alliance cards** (`alianzas.html`) — `.allies-grid` is a 3×2 grid (2 cols ≤900px, 1 col ≤540px) of six `.ally` anchors. Each card is `.ally-tag` (category chip) → `.ally-logo` (fixed 92px framed box so logos of different shapes look even; pick a `lg-w`/`lg-m`/`lg-bid`/`lg-t`/`lg-s` size class for the `<img>`) → `.ally-name` → `.ally-role` → `.ally-link`. `.ally-name`/`.ally-role` have `min-height` so all cards line up; keep six cards (or a multiple of three) or the last row goes ragged.

**Pillars band** (`index.html#enfoque`) — `.pilares-panel` holds a 4-up `.pilar` grid (Sostenibilidad · Innovación · Cooperación · Sistemas alimentarios). `.pilar` carries `position:relative;z-index:1` on purpose: `.pilar-ic::before` is the conic-gradient ring at `z-index:-1`, and without that stacking context it would paint behind the panel background and vanish.

**Contact forms** — `#contactForm` never posts anywhere; it builds a `mailto:` URL to `corpoteverde@gmail.com` and sets `window.location.href`. `nosotros.html` reuses the same `#contactForm`/`#nombre`/`#email`/`#asunto`/`#mensaje` IDs for the PQR form (with `#asunto` as a `<select>`), so it works unchanged. Keep those IDs if you add another form.

**Videos** — `.vframe` wraps a `<video>` plus `.vposter` and `.vplay` overlay. app.js forces muted/loop/inline autoplay and hides the poster on success, restoring it if `play()` rejects (browser autoplay policy). Assets live in `media/` with a matching `poster-*.jpg`.

### `css/styles.css`

Single ~830-line stylesheet, sectioned by `/* ====== NAME ====== */` banner comments; the tail (`Ajustes finales (revisión)`) holds later override patches. Design tokens live in `:root` — brand colors are named in Spanish (`--bosque`, `--lima`, `--azul`, `--hueso`, `--tinta`, `--niebla`, `--linea`), plus `--maxw`, `--rad`, `--shadow`, `--spring` easing, and three font stacks (`--display` Bricolage Grotesque, `--serif` Fraunces, `--body` Instrument Sans, loaded from Google Fonts in each page's `<head>`). Use the tokens rather than literal hex values. Layout containers are `.wrap` (max-width) inside `.sec` / `.sec-dark` / `.sec-alt` sections.

### Assets

`img/asset-<hash>.{jpg,png}` are content-hashed originals — filenames are meaningless, so identify them by the `alt` text at their usage sites. `img/logo.png`, `img/hero.jpg`, `img/minambiente.png` are named. `media/` holds the five MP4s and their posters.
