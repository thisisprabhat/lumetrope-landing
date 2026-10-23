# Lumetrope landing site

Marketing site and docs for [Lumetrope](https://github.com/thisisprabhat/lumetrope), the open-source
Lottie / dotLottie editor. React + Vite, pre-rendered to static HTML, with the Lumetrope WASM engine
loaded lazily (after first paint and idle) to play the dotLottie state-machine animations.

Requires Node 22 and pnpm (`corepack enable`). No Rust toolchain: the engine is vendored in
`src/engine/vendor/`.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server (use `--port 4180` if 5173 is taken). |
| `pnpm build` | Client build, SSR build, then `scripts/prerender.mjs` writes every route to `dist/<route>/index.html` plus `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`. |
| `pnpm preview --port 4180` | Serve `dist/` locally. |
| `pnpm test` | Vitest (unit, component, prerender and deploy-config tests). |
| `pnpm e2e` | Playwright against `pnpm preview` on port 4180. Run `pnpm build` first. Uses the installed Google Chrome (`channel: "chrome"`), so no browser download. |
| `pnpm lighthouse` | Mobile Lighthouse on `/` and `/docs/getting-started/` against `dist/`, checked against the budgets below. `LH_RUNS=3` takes the median. Full reports go to `reports/` (git-ignored); the scores go to `reports/lighthouse-summary.json` (committed). |
| `pnpm sync:engine` | Refresh the vendored engine from the Lumetrope repo. |
| `pnpm sync:release` | Snapshot the GitHub release for `SITE.VERSION` into `src/content/release.json`. The downloads section only links files that are in it. Run it (and redeploy) whenever the release gains or loses assets. |
| `pnpm animations [name ...]` | Regenerate `public/animations/*.lottie` and their posters (posters are re-encoded lossy with Chrome when it is installed). |
| `pnpm capture` | Re-record the tour video and screenshots from a running Lumetrope dev app; also writes the 960/1440 px screenshot variants (`node scripts/capture/variants.mjs` rebuilds those alone). |

Release config lives in one place, `src/config/site.ts`: `SITE_URL`, `REPO_URL`, `VERSION`,
`WEB_APP_URL` and `WEB_APP_FALLBACK_URL` (web-app links switch to the fallback when the primary
host can't be reached; see `src/lib/webApp.ts`).

## Budgets

Lighthouse mobile on `/` and `/docs/getting-started/`: Performance ≥ 90, Accessibility ≥ 95,
Best Practices ≥ 95, SEO = 100. JS ≤ 180 kB gzip before the WASM.

## Deploy

The site is a static folder: deploy `dist/` (after `pnpm build`) to any static host. There is no
SPA fallback to configure, because every route has its own pre-rendered `index.html`.

The host must:

- serve `.wasm` as **`application/wasm`** (otherwise streaming compilation fails or falls back), and
  ideally compress it: the 2.6 MB engine gzips to well under 1 MB;
- cache **`/assets/*`** (hashed file names) as `public, max-age=31536000, immutable`;
- serve **HTML** (`/`, `/index.html`, `/docs/*`) with `Cache-Control: no-cache` so a deploy is
  picked up straight away;
- cache the unhashed media (`/animations/`, `/posters/`, `/media/`, `/og/`) for a shorter time.

Ready-made configs:

- **Netlify / Cloudflare Pages:** `public/_headers` is copied into `dist/` by the build and applies
  the rules above. Both hosts merge headers when several rules match, so HTML and asset rules use
  disjoint paths and the catch-all `/*` rule sets no `Cache-Control`. Build command `pnpm build`,
  publish directory `dist`.
- **nginx:** `deploy/nginx.conf` is a server block (wasm MIME type, gzip including wasm, immutable
  `/assets/`, no-cache pages, `try_files $uri $uri/index.html`). Copy `dist/` to its `root`.

After deploying, validate the structured data with Google's Rich Results Test and
validator.schema.org.
