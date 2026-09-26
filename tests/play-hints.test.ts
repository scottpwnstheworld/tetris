import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  formatGameOverStatus,
  formatIdlePlayStatus,
  formatLineClearStatus,
} from "../src/play-hints.js";

describe("formatIdlePlayStatus", () => {
  it("mentions arrow keys for movement and counter-clockwise rotation", () => {
    const text = formatIdlePlayStatus();
    expect(text.toLowerCase()).toMatch(/arrow/);
    expect(text.toLowerCase()).toMatch(/counter[- ]?clockwise/);
  });

  it("mentions on-screen touch controls for rotate and hard drop", () => {
    const text = formatIdlePlayStatus().toLowerCase();
    expect(text).toMatch(/rotate/);
    expect(text).toMatch(/hard[- ]?drop|drop/);
    expect(text).toMatch(/touch|button|screen/);
  });
});

describe("formatLineClearStatus", () => {
  it("includes the cleared line count and repeats play hints", () => {
    const text = formatLineClearStatus(2);
    expect(text).toMatch(/2/);
    expect(text.toLowerCase()).toMatch(/line/);
    expect(text.toLowerCase()).toMatch(/arrow/);
    expect(text.toLowerCase()).toMatch(/counter[- ]?clockwise/);
  });
});

describe("formatGameOverStatus", () => {
  it("tells the player how to restart without reloading the page", () => {
    const text = formatGameOverStatus().toLowerCase();
    expect(text).toMatch(/game over/);
    expect(text).toMatch(/enter|restart/);
    expect(text).not.toMatch(/refresh the page|refresh to play again/);
  });
});

describe("play hints wiring", () => {
  it("main.ts builds status text from play-hints helpers", () => {
    const mainSource = readFileSync(new URL("../src/main.ts", import.meta.url), "utf8");
    expect(mainSource).toMatch(/from\s+["']\.\/play-hints\.js["']/);
    expect(mainSource).toMatch(/formatIdlePlayStatus\s*\(/);
    expect(mainSource).toMatch(/formatLineClearStatus\s*\(/);
    expect(mainSource).toMatch(/formatGameOverStatus\s*\(/);
    expect(mainSource).not.toMatch(
      /Arrow keys: left\/right\/down move, up rotates counter-clockwise\./,
    );
  });
});
