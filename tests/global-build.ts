// Build once for every test file that inspects dist/ (parallel files must not each rebuild it).
import { rmSync } from "node:fs";
import { execSync } from "node:child_process";

export default function setup() {
  rmSync("dist", { recursive: true, force: true });
  // Vitest sets NODE_ENV=test, which would make this a development React build (640 kB, a size
  // warning, and a dist/ that e2e and Lighthouse would then measure). Build what ships.
  execSync("pnpm build", { stdio: "inherit", env: { ...process.env, NODE_ENV: "production" } });
}
