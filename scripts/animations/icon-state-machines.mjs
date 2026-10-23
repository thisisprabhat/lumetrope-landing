// Feature icon: state-machines. Uses the Lumetrope app's own "graph" icon (see app-icons.mjs);
// hovering traces it in the accent colour.
import { appIcon } from "./icon-kit.mjs";

export const name = "icon-state-machines";

export function build() {
  return appIcon("state-machines", "#6fd3ff", "graph", { nodes: [[4, 4], [12, 4], [8, 12]] });
}
