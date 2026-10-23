// Feature icon: export. Uses the Lumetrope app's own "export" icon (see app-icons.mjs);
// hovering traces it in the accent colour.
import { appIcon } from "./icon-kit.mjs";

export const name = "icon-export";

export function build() {
  return appIcon("export", "#6fd3ff", "export");
}
