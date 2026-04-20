# artoflah portfolio — build spec

source of truth for the new portfolio. hand this to claude code alongside the starter files in this folder.

---

## overview

a personal portfolio for mi'lah clark (artoflah), a communication design student at parsons. the site is a single long-scroll page on desktop with a fixed left sidebar and a scrolling right column of six projects. each project has a central hero visual (gif of a book flipthrough, browser screenshot, etc.) surrounded by draggable satellite objects that are the physical or digital artifacts from inside that project. users can grab and rearrange satellites like spreading a project out on a table. cursor is a custom ladybug that changes state based on what you're hovering.

aesthetic direction: tactile scrapbook meets editorial. handmade and slightly unfinished, never corporate. think cargo.site energy filtered through an art-book sensibility.

---

## tech stack

- plain html, css, vanilla javascript. no framework.
- deployed on vercel.
- new github repo, new vercel project. temporary url `artoflah-v2.vercel.app` during build. swap production domain to `artoflah.vercel.app` at launch.
- one vercel serverless function for spotify now-playing (`/api/spotify`).
- no build step. scripts loaded with `defer`. fonts loaded via jsdelivr cdn (`@fontsource`).

---

## typography

display + body pairing, both loaded via @fontsource on jsdelivr.

**Instrument Serif** — project names, site name, large display moments. use italic for the main hero "artoflah" treatment (feels like a signature).

**Instrument Sans** — body text, metadata labels (what / when / for who / how / feels like), navigation.

load in `index.html` head:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/instrument-serif/400.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/instrument-sans/400.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/instrument-sans/500.css">
```

type scale:
- display / hero: 72–120px, Instrument Serif italic
- project title: 48–64px, Instrument Serif
- section label: 11–12px, Instrument Sans, uppercase, letter-spaced
- body: 14–16px, Instrument Sans, line-height 1.55
- meta label `(what)`: 11px, Instrument Sans, uppercase

---

## color palette

```css
--bg: #fafaf7;          /* off-white, warm paper */
--fg: #0a0a0a;          /* near-black */
--muted: #6b6b6b;       /* secondary text */
--accent: #ff6fa3;      /* ladybug pink */
--accent-soft: #ffd6e4; /* pink wash for hovers */
--border: rgba(0,0,0,0.08);
```

accent pink is used sparingly: the active project indicator in the sidebar, hover underlines on links, the cursor glow on pickup, the "currently listening" label. the rest is ink on paper.

---

## cursor

custom cursor rendered as a follow-the-mouse dom element. default browser cursor is hidden sitewide.

three states:

1. **ladybug (default)** — the logo ladybug, small, follows mouse. `assets/cursors/ladybug.svg`.
2. **grab / grabbing** — shows on any `.satellite` element. switches to "grabbing" (rotated / squeezed version) on `mousedown`. `assets/cursors/grab.svg` + `grab-active.svg`.
3. **play** — shows on any `.gif-hero` or hoverable motion piece. `assets/cursors/play.svg`.

implementation lives in `js/cursor.js`. uses `requestAnimationFrame` for smooth following with a tiny lag so it feels physical.

on mobile, the custom cursor is disabled (touch devices only). default tap behavior is fine.

---

## file structure

```
portfolio/
├── index.html
├── styles.css
├── js/
│   ├── main.js          entry point, wires everything up
│   ├── drag.js          draggable satellite logic
│   ├── cursor.js        custom cursor
│   ├── spotify.js       frontend fetch of now-playing
│   └── projects.js      project data + module render (optional — can also hardcode in html)
├── api/
│   └── spotify.js       vercel serverless function
├── assets/
│   ├── logo-ladybug.svg
│   ├── cursors/
│   │   ├── ladybug.svg
│   │   ├── grab.svg
│   │   ├── grab-active.svg
│   │   └── play.svg
│   └── projects/
│       ├── forever-yours/
│       │   ├── hero-flipthrough.gif
│       │   ├── motion-graphic.gif
│       │   └── satellites/
│       │       ├── cyanotype-01.png
│       │       ├── doily-01.png
│       │       └── polaroid-01.png
│       ├── come-home/
│       │   ├── hero-flipthrough.gif
│       │   └── satellites/
│       │       └── (riso pink/yellow strip cutouts, letter scans)
│       ├── scratched/
│       │   ├── hero-book.png
│       │   ├── hero-site.gif
│       │   └── satellites/
│       │       └── (graffiti strip cutouts, acrylic fragments)
│       ├── watchtower/
│       │   ├── hero-site.gif
│       │   ├── phone-mockup.png
│       │   └── satellites/
│       │       └── (alert card, live feed tile, report button)
│       ├── for-what-its-worth/
│       │   ├── hero-site.gif
│       │   ├── qr-code.png
│       │   └── satellites/
│       │       └── (ai-generated images from user sessions)
│       └── slawn-new-museum/
│           ├── hero-building.png
│           └── satellites/
│               └── (tshirts, hoodie, hat, duffel, keychain, stickers)
├── vercel.json
├── package.json
└── .env.local           (gitignored — spotify secrets)
```

---

## layout

### desktop (≥768px)

```
┌────────────────┬─────────────────────────────────────────┐
│                │                                         │
│   SIDEBAR      │            PROJECTS COLUMN              │
│   (fixed)      │            (scrolls)                    │
│                │                                         │
│   logo         │    ┌─────────────────────────────┐      │
│   bio          │    │  project 01                 │      │
│   skills       │    │  (what / when / for who /   │      │
│   programs     │    │   how / feels like)         │      │
│                │    │                             │      │
│   project list │    │      [HERO VISUAL]          │      │
│   (toc)        │    │   satellite  satellite      │      │
│                │    │         satellite           │      │
│   contact      │    │                             │      │
│   spotify      │    │  description paragraph      │      │
│                │    └─────────────────────────────┘      │
│                │                                         │
│                │    ┌─────────────────────────────┐      │
│                │    │  project 02                 │      │
└────────────────┴─────────────────────────────────────────┘
    280px                       1fr
```

sidebar is `position: sticky; top: 0;` so it stays in view while projects scroll past. project list in the sidebar is a table-of-contents: each project is a clickable link that smooth-scrolls to that project's anchor. active project (the one currently in view) gets the pink accent indicator. use `IntersectionObserver` to track which project is on screen.

### mobile (<768px)

one single scroll, no sidebar. based on the dxxidlee reference:

```
┌─────────────────┐
│ logo            │
│                 │
│ name            │
│ bio paragraph   │
│                 │
│ email           │
│ instagram       │
│ linkedin        │
│ resume          │
│                 │
│ ─────────────── │
│ selected work   │
│ 1. forever yrs  │
│ 2. come home    │
│ ...             │
│ ─────────────── │
│                 │
│ [project 1 full-width sections]
│   hero          │
│   meta          │
│   description   │
│                 │
│ [project 2]     │
│ ...             │
└─────────────────┘
```

drag is disabled on mobile. satellites become a horizontal-swipe carousel below each hero (using css `scroll-snap`). cursor swaps are disabled. spotify widget becomes a small inline card. no tricky layouts.

---

## drag behavior

hand-rolled in `js/drag.js`. no library.

requirements:
- grab any `.satellite` with mousedown
- on pickup: element lifts (subtle scale up, shadow deepens, random rotation between -6° and +6°)
- while dragging: element follows cursor with `transform: translate3d()`, maintains pickup rotation
- on release: element stays where dropped. small easing / settle animation (200ms).
- constrained to viewport: elements cannot be dragged outside the project's bounding container. clamp x/y.
- z-index management: picked-up element goes to top of stack, stays there on release.
- elements start at predefined positions (set via css custom properties `--x` and `--y`) but can be moved anywhere within their container after first drag.
- touch events mirror mouse events for tablet support (use pointer events — `pointerdown`, `pointermove`, `pointerup`).

performance: use `transform` + `will-change: transform` on satellites. do not animate `top`/`left`.

---

## project data

all six projects. use this exact copy and metadata.

### 01. forever yours, ladybug

- **(what)** forever yours, ladybug
- **(when)** 2025
- **(for who)** my boyfriend
- **(how)** book design, cyanotype, riso print, coptic binding, motion graphic
- **(feels like)** crushing

**description:**
> "forever yours, ladybug" is a multimedia project using cyanotype printing on fabric and glass and hand stippling, exploring what i call "the fear of being loved" — that specific terror of being seen completely and chosen anyway. this project is a devotional archive for my boyfriend, collecting small moments and materials that prove love exists even when it feels impossible to believe. it's about making the invisible weight of affection into something you can hold in your hands.

**hero:** gif flipthrough of the book.
**special behavior:** one satellite is the motion graphic gif, styled like a small postcard / paused video frame. it plays the motion graphic on hover.
**other satellites:** cyanotype print cutouts, doilies, polaroids of the boyfriend.

### 02. come home

- **(what)** come home
- **(when)** 2024
- **(for who)** my mom
- **(how)** book design, riso print, vellum paper
- **(feels like)** tender

**description:**
> "come home" is a riso-printed publication exploring how home isn't always a place — sometimes it's a person. through letters my mom wrote during my freshman year and text messages spanning our relationship, this book examines the idea of finding home in someone who makes you feel safe and loved no matter where you are. printed in warm pink and orange tones on vellum paper, the design blurs the line between her voice and mine through scanned handwriting, intentional typography, and a scrapbook-like layout that feels both nostalgic and deeply personal.

**hero:** gif flipthrough of the book.
**satellites:** pink/yellow halftone strip cutouts, letter scans, vellum fragments.

### 03. scratched into being

- **(what)** scratched into being
- **(when)** 2025
- **(for who)** nyc / the invisible
- **(how)** photography, essay, book design, web, three.js
- **(feels like)** defiant

**description:**
> "scratched into being" documents the desperate small marks left by people trying to prove they exist in a city designed to make them disappear. these aren't acts of vandalism but tiny rebellions — proof that someone was here, someone mattered, when everything else made them feel like ghosts. the project evolved into a physical book with an acrylic cover, mixed vellum paper types and hand-sewn binding, and an interactive website with drawing functionality over archived images. written essays on the theme of not wanting to be forgotten are embedded inside the site itself.

**hero 1 (stacked vertically):** physical book image with acrylic cover.
**hero 2:** gif screen recording of the interactive site.
**satellites:** graffiti strip cutouts, acrylic cover fragments, salvaged surface textures. qr code to visit `scratched-into-being.vercel.app`.

### 04. watchtower

- **(what)** watchtower
- **(when)** 2024
- **(for who)** parsons core 3 studio — downtown manhattan neighborhood
- **(how)** ux / ui, web app, html/css/js, civic design
- **(feels like)** necessary

**description:**
> watchtower is a community utility-tracking app designed for a downtown manhattan neighborhood experiencing frequent power and water outages. designed around three specific neighbors (a freelance mom, an elderly building super, a punk rocker renovating his apartment), the app features a color-coded real-time map, multi-channel reporting (app / text / call-in), multiple languages with picture-based icons, and a community resource sharing layer. accessibility-first, works on dying phones and offline.

**hero:** gif screen recording of the live site at `watchtower-murex.vercel.app`.
**supporting hero (stacked next to main):** phone mockup of the mobile view.
**satellites:** alert card, live feed tile, "report outage" button screenshot, tiny persona illustrations.

### 05. for what it's worth

- **(what)** for what it's worth
- **(when)** 2024
- **(for who)** self
- **(how)** interactive web, generative imagery, html/css/js
- **(feels like)** introspective

**description:**
> "for what it's worth" is an interactive web experience that explores the courage it takes to step outside our safety nets when outcomes aren't guaranteed. users answer a series of value-based questions, and the site generates imagery in response to their answers using ai. the project examines those crossroads where we choose potential meaning over comfortable insignificance, recognizing that sometimes value isn't measured in guaranteed outcomes but in our willingness to risk something precious.

**hero:** gif screen recording of the live site at `for-what-its-worth.vercel.app`.
**satellites:** several ai-generated images from real user sessions, plus a qr code that scans to the live site.

### 06. slawn x new museum (speculative)

**to confirm with user — using reasonable defaults:**

- **(what)** slawn × new museum
- **(when)** 2025
- **(for who)** speculative collaboration — new museum, nyc
- **(how)** branding, merch design, exhibition design, exterior mural concept
- **(feels like)** loud

**description placeholder (mimi to write):**
> a speculative brand world imagining a collaboration between slawn and the new museum, extending his painterly vocabulary into wearables, signage, and a building-facade mural concept. explores what it looks like when a street-rooted visual language takes over an institutional space on its own terms.

**hero:** rendered image of the new museum building with mural applied.
**satellites:** tshirts (2), hoodie, cap, duffel bag, keychain, stickers, postcard.

**important:** this project must be clearly labeled "speculative" in its description to prevent misreading as a real paid engagement.

---

## spotify now-playing

lives in the sidebar, under the contact links. shows "currently listening to:" followed by track name + artist when spotify is active, otherwise "last played: ___".

### setup (one-time):

1. create spotify developer app at developer.spotify.com. get `CLIENT_ID` and `CLIENT_SECRET`.
2. run the oauth flow once to get a `REFRESH_TOKEN` with scope `user-read-currently-playing user-read-recently-played`.
3. add to vercel project env vars:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_REFRESH_TOKEN`

### server: `api/spotify.js`

vercel serverless function that:
1. uses the refresh token to get a fresh access token.
2. calls `GET /v1/me/player/currently-playing`.
3. if nothing is playing, falls back to `GET /v1/me/player/recently-played?limit=1`.
4. returns `{ isPlaying: bool, title, artist, albumArt, trackUrl }`.

### frontend: `js/spotify.js`

- fetches `/api/spotify` on load
- polls every 30 seconds while page is visible (pause polling when `document.hidden === true`)
- renders into `#now-playing` element in sidebar

---

## assets checklist

mimi to produce / export:

**gifs (book flipthroughs — already made per mimi):**
- [ ] forever yours, ladybug flipthrough
- [ ] come home flipthrough
- [ ] scratched into being book (image or flipthrough)
- [ ] forever yours, ladybug motion graphic

**gifs (screen recordings — to make):**
- [ ] watchtower live site (~5–10s loop)
- [ ] scratched into being site
- [ ] for what it's worth site (showing the drag-values interaction)

**cutout pngs (transparent background) for satellites:**
- [ ] forever yours: 3–5 cyanotypes, 2 doilies, 2–3 polaroids
- [ ] come home: 3–4 riso strip cutouts, 1–2 letter scans, vellum texture
- [ ] scratched: 3–4 graffiti strip cutouts, acrylic cover fragments
- [ ] watchtower: 1 phone mockup, 2–3 ui element screenshots
- [ ] for what it's worth: 3–5 ai-generated session images, 1 qr code
- [ ] slawn x new museum: 2 tshirts, 1 hoodie, 1 hat, 1 duffel, 1 keychain, stickers

**ui assets:**
- [x] ladybug logo (provided — `logo-ladybug.svg`)
- [ ] cursor ladybug svg (small, ~24px)
- [ ] cursor grab / grabbing svgs
- [ ] cursor play svg

**spotify env vars set in vercel.**

---

## build phases

work in this order. each phase should produce something visually checkable.

### phase 1 — skeleton
- set up github repo, vercel project, base files
- load fonts, define css variables
- html skeleton with sidebar + project column grid
- basic sidebar content (bio, skills, programs, contact placeholders)
- project list in sidebar (table of contents with anchors)

### phase 2 — one project template
- build forever yours, ladybug as the template module
- metadata block with all 5 fields
- hero gif placeholder
- static satellite positions (no drag yet)
- description paragraph
- this is the pattern all other projects follow

### phase 3 — drag behavior
- implement `drag.js`
- wire up all `.satellite` elements
- add pickup rotation, momentum settle, viewport clamping
- test with 5 satellites at once

### phase 4 — cursor
- implement `cursor.js` with ladybug default
- add grab and play states
- hide native cursor sitewide
- test state switching on hover

### phase 5 — duplicate projects
- build come home, scratched, watchtower, for what it's worth, slawn x new museum
- each using the phase 2 template
- add the motion graphic hover-to-play on forever yours

### phase 6 — sidebar polish
- intersection observer for active project indicator in toc
- smooth scroll on toc click
- accent color states

### phase 7 — spotify
- set up serverless function in `api/spotify.js`
- add env vars
- build frontend widget in sidebar
- poll every 30s

### phase 8 — mobile
- media query at 768px
- collapse sidebar content into top section
- disable drag, switch satellites to horizontal-swipe carousel
- disable custom cursor

### phase 9 — polish
- page load choreography (staggered reveal of sidebar then first project)
- satellite entrance animations (subtle, on scroll-into-view)
- favicon (mini ladybug)
- og image / meta tags
- 404 page

### phase 10 — launch
- point `artoflah.vercel.app` at the new project
- retire old repo

---

## first prompt to claude code

paste this into claude code in your terminal after dropping the starter files in place:

```
i'm building a portfolio site for myself (artoflah / mi'lah clark). read SPEC.md for the full plan. the starter files (index.html, styles.css, js/*) are scaffolded for phase 1. please continue from phase 2: build the first project module for "forever yours, ladybug" following the template pattern described in SPEC.md. use placeholder images from placehold.co for now where i haven't added real assets yet. keep to vanilla html/css/js, no framework, no build step. match the existing code style.
```

after phase 2 ships and looks right, move on to phase 3 (drag) with a similar prompt pointing at the spec.
