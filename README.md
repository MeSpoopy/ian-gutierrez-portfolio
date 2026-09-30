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
- `next-site/components/Scene.tsx`: isolated R3F sculpture; demand rendering stops when pointer/selection motion settles, with a static WebGL fallback.
- `next-site/components/ConnectionStory.tsx` and `connection-story.css`: optional native-scroll SVG story and its responsive static presentation.
- `next-site/app/globals.css`, `home-story.css`, `motion.css`: shared dark visual system, homepage story layouts, and restrained interaction feedback.
- `case-studies/`: all fourteen preserved project URLs, with `styles.css` and `editorial.css`.
- `script.js`: image viewer and interactions for case studies and policy pages.
- `projects/`, `credentials/`, `logos/`, portrait files: user-approved evidence and images.
- `fonts/`: self-hosted DM Sans and Manrope with OFL licenses.

The three featured projects and the first five additional projects are Zoho work. AI Resume Analyzer remains labeled as a proposed application. No invented impact metrics are added. The source document screenshot containing private webhook credentials is excluded from public assets.

## Accessibility and motion

All critical content is prerendered HTML. Navigation, project links and contact links work without WebGL. The sculpture has pause and still-artwork controls, follows reduced-motion preferences, and stops while offscreen or the page is hidden. Screens up to 800px initially use static artwork. The static fallback stays visible until a real 3D frame has rendered; it also covers loading and WebGL failure.

One optional sticky SVG sequence connects three shapes during native scrolling on sufficiently large screens. Every chapter remains readable throughout. Smaller screens, reduced motion, pause, and still-artwork mode use the completed diagram. There is no scroll interception, idle artwork loop, or content hidden behind an entrance animation.

Fine-pointer hover feedback, immediate keyboard states, native disclosures, two skip links, focus-visible styling, a named native image dialog with Escape/focus return and zoom, and responsive layouts are included.

## Private Admin and analytics

- `admin.html` remains the public entry to the separately authenticated Cloudflare Worker at https://ian-portfolio-admin.ianvananthony2000.workers.dev/ . No credentials or private statistics are embedded here.
- `analytics.js` loads the public Cloudflare beacon only on the production portfolio host/path. Local previews and Admin are excluded.
- Cloudflare reports visits/page views and approximate countries, not exact unique people or GPS. Reporting began on 13 September 2026.
- `terms.html` and `privacy.html` describe the portfolio’s data practices. Fonts are served by GitHub Pages with the website.
- Keep Cloudflare API tokens, authentication configuration, and source documents out of this repository.

## Design direction

Navy surfaces, soft-blue actions, near-white headings, and readable cool-gray body text. The homepage brings a real vendor-map preview and selected projects ahead of the compact approach, followed by experience, concise education and credentials, and a labeled contact invitation. The three featured projects retain distinct compositions with consistent facts about role, delivery, and supported outcome. The contract example explicitly separates intended value from the configuration and partial code shown as evidence. All fourteen case studies remain available, with screenshots brought forward on their detail pages. Public visitor navigation omits Admin; its authenticated entry remains at its existing URL.

Oryzo informs narrative pacing and continuity; its branding and assets are not copied. Real project screenshots, portraits, company logos, and credential artwork provide evidence. The connected shape returns at the final contact invitation. `DESIGN.md` records the implemented design system. Impeccable, design-taste-frontend, and animation guidance were authoring tools, not website runtime dependencies.
