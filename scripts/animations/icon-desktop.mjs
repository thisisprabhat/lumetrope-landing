// Feature icon: desktop. Uses the Lumetrope app's own "layers" icon (see app-icons.mjs);
// hovering traces it in the accent colour.
import { appIcon } from "./icon-kit.mjs";

export const name = "icon-desktop";

export function build() {
  return appIcon("desktop", "#6fd3ff", "layers");
}
