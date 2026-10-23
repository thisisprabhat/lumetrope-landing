// Feature icon: version-history. Uses the Lumetrope app's own "history" icon (see app-icons.mjs);
// hovering traces it in the accent colour.
import { appIcon } from "./icon-kit.mjs";

export const name = "icon-version-history";

export function build() {
  return appIcon("version-history", "#7ee2a8", "history");
}
