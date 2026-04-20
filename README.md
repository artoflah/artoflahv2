# artoflah portfolio

new portfolio site for mi'lah clark / artoflah. plain html / css / js deployed on vercel.

## quickstart

```bash
# 1. drop these files into a new git repo
git init
git add .
git commit -m "initial scaffold"

# 2. push to github, then import into vercel as a new project
# 3. set spotify env vars in vercel:
#    SPOTIFY_CLIENT_ID
#    SPOTIFY_CLIENT_SECRET
#    SPOTIFY_REFRESH_TOKEN

# 4. for local dev
npx serve .
# or any static server — open http://localhost:3000

# 5. for local testing of the /api/spotify serverless function
npm i -g vercel
vercel dev
```

## file map

- `SPEC.md` — full design + build spec. **read this first.**
- `index.html` — skeleton with sidebar + first project module as template
- `styles.css` — design tokens, layout, project module, satellites, cursor, mobile
- `js/drag.js` — draggable satellite logic (pointer events, viewport-clamped)
- `js/cursor.js` — custom ladybug cursor with grab / play states
- `js/spotify.js` — frontend polling for now-playing
- `js/main.js` — toc active state (intersection observer), smooth scroll
- `api/spotify.js` — vercel serverless function for spotify api
- `assets/` — images, cursors, project media (you add these)

## what's scaffolded

phase 1 (skeleton) and phase 2 (one project template — forever yours, ladybug) are done. drag + cursor logic is written. spotify backend + frontend is written (needs env vars).

## what to do next

1. drop in real assets per the checklist in SPEC.md
2. ask claude code to build out the remaining 5 projects following the template pattern in index.html. prompt:

   > read SPEC.md. the forever-yours project module in index.html is the template. build out projects 02–06 (come home, scratched into being, watchtower, for what it's worth, slawn x new museum) following the same structure, using the metadata and descriptions from SPEC.md. use placehold.co placeholders for images i haven't added yet.

3. export / record screen gifs, cut out satellite pngs with transparent backgrounds, drop into `assets/projects/[project-name]/`
4. run `vercel --prod` and point `artoflah.vercel.app` at the new project

see SPEC.md for everything else.
