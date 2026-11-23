# topophiliadesign.com

Static site for Topophilia Design (Sync Race Studios client). Hosted on Vercel, edited through the SRCS CMS (site key `topophilia-design`).

- Shared nav/footer live in `src/site.config.mjs`. After changing them run `node tools/chrome.mjs` (also rebuilds sitemap.xml), then commit.
- Client intake form posts to `api/intake.js`, which emails the studio through Resend. Set `RESEND_API_KEY`, `INTAKE_TO`, `INTAKE_FROM` in Vercel.
- Placeholders still to fill: see CONTENT-TODO.md.
