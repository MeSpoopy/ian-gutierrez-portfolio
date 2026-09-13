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

## Policies and owner access

- terms.html and privacy.html describe the portfolio and its current data practices.
- admin.html is a public owner entry page, excluded from search indexing. It is not an authentication boundary and currently displays setup pending.
- Footer links are included on the homepage, all nine case studies, and these three pages.

Audience analytics are NOT configured. No visitor counts or countries are collected by an added analytics script. GitHub still processes hosting/security logs, and Google Fonts receives font requests.

### Connecting private analytics

The owner must choose and sign into an analytics provider before real reports can be enabled. Cloudflare Web Analytics is a suitable option for visits, page views, paths, and country breakdowns without moving GitHub Pages hosting:
https://developers.cloudflare.com/web-analytics/get-started/

1. In the owner's Cloudflare account, add mespoopy.github.io as a Web Analytics site and choose manual JavaScript installation.
2. Obtain the site's public beacon snippet and owner dashboard URL. Never commit a Cloudflare API token, account password, or other secret to this public repository.
3. Include the official snippet on the homepage and case studies, plus any policy pages intended to be measured. Exclude the admin entry page and local previews. The hostname covers other projects too; use the /ian-gutierrez-portfolio/ path filter when reviewing this portfolio.
4. Update privacy.html BEFORE activating collection, naming the actual provider, collected metrics, approximate country information, purpose, provider privacy information, and retention limits verified at setup time.
5. Update admin.html with an owner dashboard link and clear sign-in text. Authentication and reporting must remain at the provider, not in public JavaScript. A custom dashboard would require a separately secured backend.
6. Verify a real page view appears in the authenticated report before changing the setup-pending state. Do not invent data or imply earlier visits can be recovered.

Cloudflare reports visits and page views, not a verified number of unique people. Its location dimension is country, not precise GPS, street address, or city:
https://developers.cloudflare.com/web-analytics/data-metrics/dimensions/

Keep the published Privacy Policy consistent with the implementation whenever data practices change.
