// Feature icon: mcp. Uses the Lumetrope app's own "mcp" icon (see app-icons.mjs);
// hovering traces it in the accent colour.
import { appIcon } from "./icon-kit.mjs";

export const name = "icon-mcp";

export function build() {
  return appIcon("mcp", "#b69cff", "mcp");
}
