// Feature icon: timeline. Uses the Lumetrope app's own "diamond" icon (see app-icons.mjs);
// hovering traces it in the accent colour.
import { appIcon } from "./icon-kit.mjs";

export const name = "icon-timeline";

export function build() {
  return appIcon("timeline", "#ffb340", "diamond");
}
