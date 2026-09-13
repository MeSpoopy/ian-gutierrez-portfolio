# Ian Van Anthony Gutierrez — Portfolio

A static portfolio featuring Zoho development, business automation, product design, professional experience, and nine project case studies.

## Website

Published with GitHub Pages from the root of the codex/github-pages branch. All links and assets use relative paths so the site also works under a repository URL.

## Local preview

Run python -m http.server 4173 from this folder, then open http://127.0.0.1:4173/.

## Editing

- index.html: homepage, experience, education, recognitions, and contact details.
- case-studies/: nine individual project pages.
- styles.css: responsive layout and styling.
- script.js: accessible image previews and footer year.
- projects/ and credentials/: supporting screenshots.

No build step or backend is required. Commit updates to the publishing branch to update the live site.

The case studies distinguish demonstrated interfaces and workflows from unverified outcomes. Original documents and private hosting configuration are not included.

Visual inspiration: [Videaste on Dribbble](https://dribbble.com/shots/23090247-Videaste-Personal-Videographer-Portfolio-Landing-Page-Website).

## Policies and owner analytics

- terms.html and privacy.html describe the portfolio and its current data practices.
- admin.html is a public entry page linking to the authenticated Cloudflare dashboard, not an authentication boundary. No private statistics or login credentials are embedded.
- analytics.js loads the official Cloudflare module on the production hostname and portfolio path only. It is included on the home page, nine case studies, and two policy pages. The Admin page and local previews are excluded.
- The beacon identifier is public by design. Never add Cloudflare API tokens or account passwords to this repository.
- Reporting began on 13 September 2026. Cloudflare reports visits and page views, not exact unique people. Location is approximate country, not GPS or city.
- Dashboard data is protected by Cloudflare account authentication. Hosting remains on GitHub Pages.
- If other projects are later connected to this same analytics site, filter paths to /ian-gutierrez-portfolio/ when viewing reports.
- Keep the privacy policy synchronized with any tracking changes. To disable collection, remove the analytics.js script includes from public pages and update the policy.

Provider documentation: https://developers.cloudflare.com/web-analytics/
