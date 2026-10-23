import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const dist = resolve("dist");
const template = readFileSync(join(dist, "index.html"), "utf8");
const { render, ROUTE_PATHS: paths } = await import(pathToFileURL(join(dist, "server", "entry-server.js")).href);

for (const path of paths) {
  const { html, head } = render(path);
  const out = template.replace("<!--head-->", () => head).replace("<!--app-->", () => html);
  const file = join(dist, path, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, out);
  console.log("prerendered", path);
}
