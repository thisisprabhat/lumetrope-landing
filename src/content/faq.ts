import { platformsAnswer } from "./availability";
import { publishedDownloads, type Download } from "../config/site";

/** Landing-page FAQ. Rendered by src/sections/Faq.tsx and reused for FAQPage JSON-LD. Plain text only. */
export function faqFor(list: Download[]): { q: string; a: string }[] {
  return [
  {
    q: "Is Lumetrope free and open source?",
    a: "Yes. Lumetrope is free and open source under the MIT licence, for the desktop app and the web app alike. The bundled Poppins font is under the SIL Open Font License.",
  },
  {
    q: "What can I open, save and export?",
    a: "It opens Lottie JSON (.json), dotLottie (.lottie) and SVG files. It saves dotLottie and Lottie JSON, and exports animated GIF, WebP and WebM with transparency.",
  },
  {
    q: "Can I make interactive animations?",
    a: "Yes. Lumetrope builds dotLottie 2.0 state machines on a node graph: states, transitions, guards, inputs and interactions such as click, hover and pointer moves. The live preview lets you click and hover the real animation to test it.",
  },
  {
    q: "Will my animations play outside Lumetrope?",
    a: "Yes. Lumetrope writes standard Lottie JSON and dotLottie 2.0 files, so they play in any player that supports those formats. State machines and themes travel inside the .lottie file and need a player that supports dotLottie 2.0 state machines.",
  },
  {
    q: "Where are my projects stored?",
    a: "On your device. Projects and their version history are kept locally with autosave. There is no Lumetrope server and no account to create.",
  },
  {
    q: "Does it work offline?",
    a: "The desktop app works fully offline. The web app is a static site that needs to load once in your browser.",
  },
  {
    q: "Which platforms does it run on?",
    a: platformsAnswer(list),
  },
  {
    q: "Can an AI agent use Lumetrope?",
    a: "Yes, through MCP. The lumetrope-mcp server gives agents such as Claude Code, Codex, Cursor and Claude Desktop more than 100 tools to read and edit the open animation. It needs the desktop app, or a copy of Lumetrope served from localhost, plus Node.js 20 or newer.",
  },
  {
    q: "Does it keep a version history?",
    a: "Yes. You can save versions, restore any of them, branch and diff. History lives in local storage on your device, so keep important work saved to a file as well.",
  },
  {
    q: "Why does my computer warn me when I first open the app?",
    a: "Builds that are not signed or notarized trigger Gatekeeper on macOS and SmartScreen on Windows. On macOS, right-click the app and choose Open; on Windows, choose More info and then Run anyway. The install guides cover each step.",
  },
  {
    q: "Can I host the web app myself?",
    a: "Yes. The web app is a folder of static files with no backend. Serve it over https from any web server, ideally with .wasm files sent as application/wasm.",
  },
];
}

/** The FAQ for the builds the current release really ships. */
export const FAQ = faqFor(publishedDownloads());
