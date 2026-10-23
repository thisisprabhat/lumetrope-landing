// Build once for every test file that inspects dist/ (parallel files must not each rebuild it).
import { rmSync } from "node:fs";
import { execSync } from "node:child_process";

export default function setup() {
  rmSync("dist", { recursive: true, force: true });
  execSync("pnpm build", { stdio: "inherit" });
}
