import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Players wait for load + two frames + idle before importing the engine (src/player/startGate.ts).
// Component tests drive players directly, so give them an open gate; tests/startGate.test.ts
// covers the real one through createAfterFirstPaint.
vi.mock("../src/player/startGate", async (orig) => ({
  ...(await orig<typeof import("../src/player/startGate")>()),
  afterFirstPaint: () => Promise.resolve(),
}));
