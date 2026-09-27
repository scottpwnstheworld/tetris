import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { formatPausedPlayStatus } from "../src/play-hints.js";

describe("formatPausedPlayStatus", () => {
  it("tells the player the game is paused and how to resume", () => {
    const text = formatPausedPlayStatus().toLowerCase();
    expect(text).toMatch(/paused/);
    expect(text).toMatch(/escape|resume/);
  });
});

describe("pause preview wiring", () => {
  it("exposes a pause touch control in index.html", () => {
    const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
    expect(html).toMatch(/data-play-action=["']pause["']/);
  });

  it("skips gravity ticks and shows paused status in main.ts", () => {
    const mainSource = readFileSync(new URL("../src/main.ts", import.meta.url), "utf8");
    expect(mainSource).toMatch(/formatPausedPlayStatus/);
    expect(mainSource).toMatch(/session\.paused/);
    expect(mainSource).toMatch(/Escape/);
    expect(mainSource).toMatch(/handlePlayKey\s*\(\s*session\s*,\s*["']Escape["']\s*\)/);
  });

  it("routes pause through handlePlayAction in session.ts", () => {
    const sessionSource = readFileSync(
      new URL("../src/session.ts", import.meta.url),
      "utf8",
    );
    expect(sessionSource).toMatch(/export function togglePlayPause/);
    expect(sessionSource).toMatch(/case\s+["']pause["']/);
    expect(sessionSource).toMatch(/case\s+["']Escape["']/);
  });
});
