// Feature icon: wasm-engine. Uses the Lumetrope app's own "bolt" icon (see app-icons.mjs);
// hovering traces it in the accent colour.
import { appIcon } from "./icon-kit.mjs";

export const name = "icon-wasm-engine";

export function build() {
  return appIcon("wasm-engine", "#ffb340", "bolt");
}
