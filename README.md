# Ian Gutierrez — Portfolio

A Next.js 16 and React 19 portfolio with a React Three Fiber / Three.js interactive hero, fourteen evidence-led case studies, professional experience, and credentials. Published on GitHub Pages from the root of `codex/github-pages`.

## Edit and build

Homepage source is in `next-site/`. Do not manually edit the generated root `index.html` or `_next/` assets.

```sh
cd next-site
npm ci
npm run build
npm run publish:static
python scripts/preview.py
```

Preview at http://127.0.0.1:4173/ian-gutierrez-portfolio/ . The build uses Next’s static export and the repository base path `/ian-gutierrez-portfolio`. The publishing script copies the export to the repository root without removing case studies or public assets. Commit that output with its source, then push the publishing branch.

- `next-site/components/Portfolio.tsx`: homepage content and accessible interactions.
- `next-site/components/Scene.tsx`: isolated R3F sculpture, demand rendering when paused, offscreen or reduced motion; WebGL fallback.
- `next-site/app/globals.css`, `motion.css`: consolidated dark visual system and motion.
- `case-studies/`: all fourteen preserved project URLs, with `styles.css` and `editorial.css`.
- `script.js`: image viewer and interactions for case studies and policy pages.
- `projects/`, `credentials/`, `logos/`, portrait files: user-approved evidence and images.
- `fonts/`: self-hosted DM Sans and Manrope with OFL licenses.

The three featured projects and the first five additional projects are Zoho work. AI Resume Analyzer remains labeled as a proposed application. No invented impact metrics are added. The source document screenshot containing private webhook credentials is excluded from public assets.

## Accessibility and motion

All critical content is prerendered HTML. Navigation, project links and contact links work without WebGL. The sculpture has a pause control, follows reduced-motion preferences, and stops while offscreen or the page is hidden. Fine-pointer hover motion, immediate keyboard states, native disclosures, focus-visible styling, a named native image dialog with Escape/focus return and zoom, and responsive layouts are included. The no-WebGL fallback uses CSS geometry.

## Private Admin and analytics

- `admin.html` remains the public entry to the separately authenticated Cloudflare Worker at https://ian-portfolio-admin.ianvananthony2000.workers.dev/ . No credentials or private statistics are embedded here.
- `analytics.js` loads the public Cloudflare beacon only on the production portfolio host/path. Local previews and Admin are excluded.
- Cloudflare reports visits/page views and approximate countries, not exact unique people or GPS. Reporting began on 13 September 2026.
- `terms.html` and `privacy.html` describe the portfolio’s data practices. Fonts are served by GitHub Pages with the website.
- Keep Cloudflare API tokens, authentication configuration, and source documents out of this repository.

## Design direction

Near-black, warm white, and acid lime. An interactive connected-system sculpture links applications, automation, and intelligence to actual case studies; actual project screenshots, portraits, company logos, and credential artwork provide the evidence. Typography, responsive hierarchy, purposeful motion, and touch/keyboard behavior were refined using Impeccable, design-taste-frontend, and Emil Kowalski’s design/animation guidance. These authoring skills are installed in the local Codex skills folder and are not website runtime dependencies.
