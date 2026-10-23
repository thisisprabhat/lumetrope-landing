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
| `pnpm build` | Client build, SSR build, then `scripts/prerender.mjs` writes every route to `dist/<route>/index.html` plus `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`, and deletes the SSR bundle (`dist/server`), so `dist/` holds exactly what is deployed. |
| `pnpm preview --port 4180` | Serve `dist/` locally. |
| `pnpm test` | Vitest (unit, component, prerender and deploy-config tests). |
| `pnpm e2e` | Playwright against `pnpm preview` on port 4180. Run `pnpm build` first. Uses the installed Google Chrome (`channel: "chrome"`), so no browser download. |
| `pnpm lighthouse` | Mobile Lighthouse on `/` and `/docs/getting-started/` against `dist/`, checked against the budgets below. `LH_RUNS=3` takes the median. Each run first clears `reports/`; full reports go there (git-ignored, the median run as `<page>.report.{html,json}`) and the scores to `reports/lighthouse-summary.json` (committed). |
| `pnpm sync:engine` | Refresh the vendored engine from the Lumetrope repo. |
| `pnpm sync:release` | Snapshot the GitHub release for `SITE.VERSION` into `src/content/release.json`. The downloads section only links files that are in it. Run it (and redeploy) whenever the release gains or loses assets. |
| `pnpm animations [name ...]` | Regenerate `public/animations/*.lottie` and their posters (posters are re-encoded lossy with Chrome when it is installed). |
| `pnpm capture` | Re-record the tour video and screenshots from a running Lumetrope dev app; also writes the 960/1440 px screenshot variants (`node scripts/capture/variants.mjs` rebuilds those alone). |

Release config lives in one place, `src/config/site.ts`: `SITE_URL`, `REPO_URL`, `VERSION`,
`WEB_APP_URL` and `WEB_APP_FALLBACK_URL`. Web-app links point at the primary; on first intent or
click the host is probed (2.5 s timeout), a click is held until the probe settles, and every link
switches to the fallback if the primary can't be reached (`src/lib/webApp.ts`).

Known issue: the vendored `.wasm` under `src/engine/vendor/` still contains build-machine home
paths until the next `pnpm sync:engine`, which now remaps them.

## OG images

Regenerate the social/OG images with `node scripts/og.mjs`. If `og.lottie` changed, run
`pnpm animations` first.

## Releasing a new Lumetrope version

1. Bump `VERSION` in `src/config/site.ts`.
2. Run `pnpm sync:release` (the GitHub release must already be published).
3. Bump `DOCS_UPDATED` if the docs changed.
4. Run `pnpm test`, `pnpm typecheck`, `pnpm build` and `pnpm e2e`.
5. Deploy.

The e2e Downloads spec assumes the release has a macOS dmg (it checks the Apple Silicon dmg link).

## Budgets

Lighthouse mobile on `/` and `/docs/getting-started/`: Performance ≥ 90, Accessibility ≥ 95,
Best Practices ≥ 95, SEO = 100. JS ≤ 180 kB gzip before the WASM.

## Deploy

The site is a static folder: deploy `dist/` (after `pnpm build`) to any static host. It contains
only public files (the SSR bundle used for pre-rendering is deleted at the end of the build). There
is no SPA fallback to configure, because every route has its own pre-rendered `index.html`.

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
- **nginx:** `deploy/nginx.conf` is a server block. Recent `mime.types` already maps `.wasm` to
  `application/wasm`; for older nginx the wasm location sets it locally, so `nginx -t` gives no
  duplicate-extension warning (checked with nginx 1.31). It gzips JS (`text/javascript` and
  `application/javascript`), CSS, SVG and wasm, caches `/assets/` immutably, serves pages with
  no-cache and uses `try_files $uri $uri/index.html`. Copy `dist/` to its `root`.

After deploying, validate the structured data with Google's Rich Results Test and
validator.schema.org.
