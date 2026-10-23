// Snapshot the GitHub release for SITE.VERSION into src/content/release.json, so the downloads
// section only links assets that really exist (with their sizes). Run before a deploy whenever a
// release gains or loses assets:
//   pnpm sync:release            (GITHUB_TOKEN is optional; it only raises the API rate limit)
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const site = readFileSync(join(root, "src/config/site.ts"), "utf8");
const repo = site.match(/REPO_URL:\s*"https:\/\/github\.com\/([^"]+)"/)?.[1];
const version = site.match(/VERSION:\s*"([^"]+)"/)?.[1];
if (!repo || !version) throw new Error("could not read REPO_URL / VERSION from src/config/site.ts");

const headers = { accept: "application/vnd.github+json", "user-agent": "lumetrope-landing" };
if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
const res = await fetch(`https://api.github.com/repos/${repo}/releases/tags/v${version}`, { headers });
if (!res.ok) throw new Error(`GitHub API ${res.status} for ${repo} v${version}: ${await res.text()}`);
const r = await res.json();

const out = {
  repo,
  tag: r.tag_name,
  url: r.html_url,
  publishedAt: r.published_at,
  assets: r.assets.map((a) => ({ name: a.name, size: a.size })).sort((a, b) => a.name.localeCompare(b.name)),
};
writeFileSync(join(root, "src/content/release.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`release.json: ${repo} ${out.tag}, ${out.assets.length} assets`);
for (const a of out.assets) console.log(`  ${a.name}  ${(a.size / 1048576).toFixed(1)} MB`);
