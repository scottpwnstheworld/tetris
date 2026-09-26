import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { formatLevelText } from "../src/render.js";

describe("formatLevelText", () => {
  it("formats a human-readable level label for the HUD", () => {
    expect(formatLevelText(1)).toBe("Level: 1");
    expect(formatLevelText(4)).toBe("Level: 4");
  });
});

describe("level HUD wiring", () => {
  it("exposes a level element in index.html", () => {
    const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
    expect(html).toMatch(/\bid=["']level["']/i);
  });

  it("updates the level element from session totals in main.ts", () => {
    const mainSource = readFileSync(new URL("../src/main.ts", import.meta.url), "utf8");
    expect(mainSource).toMatch(/getElementById\s*\(\s*["']level["']\s*\)/);
    expect(mainSource).toMatch(/formatLevelText/);
    expect(mainSource).toMatch(/totalLinesCleared/);
  });

  it("derives gravity timing from gravity-speed instead of a fixed 800ms constant only", () => {
    const mainSource = readFileSync(new URL("../src/main.ts", import.meta.url), "utf8");
    expect(mainSource).toMatch(/from\s+["']\.\/gravity-speed\.js["']/);
    expect(mainSource).toMatch(/gravityIntervalMs\s*\(/);
    expect(mainSource).not.toMatch(/const\s+GRAVITY_MS\s*=\s*800\s*;/);
  });

  it("reschedules the gravity timer when the interval changes after line clears", () => {
    const mainSource = readFileSync(new URL("../src/main.ts", import.meta.url), "utf8");
    expect(mainSource).toMatch(/clearInterval/);
    expect(mainSource).toMatch(/setInterval/);
    expect(mainSource).toMatch(/scheduleGravity|rescheduleGravity|syncGravityInterval/);
  });
});
