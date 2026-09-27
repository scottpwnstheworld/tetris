import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { formatIdlePlayStatus } from "../src/play-hints.js";

describe("mobile movement touch controls in index.html", () => {
  it("exposes left, right, and down movement buttons", () => {
    const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
    expect(html).toMatch(/data-play-action=["']move-left["']/);
    expect(html).toMatch(/data-play-action=["']move-right["']/);
    expect(html).toMatch(/data-play-action=["']move-down["']/);
  });
});

describe("mobile movement session dispatch", () => {
  it("implements move-left, move-right, and move-down in handlePlayAction", () => {
    const sessionSource = readFileSync(
      new URL("../src/session.ts", import.meta.url),
      "utf8",
    );
    expect(sessionSource).toMatch(/case\s+["']move-left["']/);
    expect(sessionSource).toMatch(/case\s+["']move-right["']/);
    expect(sessionSource).toMatch(/case\s+["']move-down["']/);
    expect(sessionSource).toMatch(/handlePlayKey\s*\(\s*session\s*,\s*["']ArrowLeft["']\s*\)/);
    expect(sessionSource).toMatch(/handlePlayKey\s*\(\s*session\s*,\s*["']ArrowRight["']\s*\)/);
    expect(sessionSource).toMatch(/handlePlayKey\s*\(\s*session\s*,\s*["']ArrowDown["']\s*\)/);
  });

  it("blocks touch movement while paused before dispatching keys", () => {
    const sessionSource = readFileSync(
      new URL("../src/session.ts", import.meta.url),
      "utf8",
    );
    expect(sessionSource).toMatch(/session\.paused/);
    expect(sessionSource).toMatch(/move-left|move-right|move-down/);
  });
});

describe("mobile movement documentation", () => {
  it("mentions on-screen left/right/down controls in README", () => {
    const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8").toLowerCase();
    expect(readme).toMatch(/move-left|left.*button|button.*left/);
    expect(readme).toMatch(/move-right|right.*button|button.*right/);
    expect(readme).toMatch(/move-down|down.*button|button.*down/);
  });

  it("mentions touch-friendly movement in idle play hints", () => {
    const text = formatIdlePlayStatus().toLowerCase();
    expect(text).toMatch(/left/);
    expect(text).toMatch(/right/);
    expect(text).toMatch(/touch|button|screen/);
  });
});
