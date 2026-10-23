// Feature icon: themes. Uses the Lumetrope app's own "palette" icon (see app-icons.mjs);
// hovering traces it in the accent colour.
import { appIcon } from "./icon-kit.mjs";

export const name = "icon-themes";

export function build() {
  return appIcon("themes", "#b69cff", "palette");
}
