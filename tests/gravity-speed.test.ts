import { describe, expect, it } from "vitest";
import {
  BASE_GRAVITY_INTERVAL_MS,
  MIN_GRAVITY_INTERVAL_MS,
  gravityIntervalMs,
  levelFromTotalLines,
} from "../src/gravity-speed.js";

describe("levelFromTotalLines", () => {
  it("starts at level 1 with zero lines cleared", () => {
    expect(levelFromTotalLines(0)).toBe(1);
  });

  it("advances one level for every ten total lines cleared", () => {
    expect(levelFromTotalLines(9)).toBe(1);
    expect(levelFromTotalLines(10)).toBe(2);
    expect(levelFromTotalLines(29)).toBe(3);
    expect(levelFromTotalLines(30)).toBe(4);
  });
});

describe("gravityIntervalMs", () => {
  it("uses the base interval at level 1", () => {
    expect(BASE_GRAVITY_INTERVAL_MS).toBe(800);
    expect(gravityIntervalMs(0)).toBe(800);
    expect(gravityIntervalMs(9)).toBe(800);
  });

  it("speeds up by a fixed step each level until the minimum cap", () => {
    expect(gravityIntervalMs(10)).toBe(720);
    expect(gravityIntervalMs(20)).toBe(640);
    expect(MIN_GRAVITY_INTERVAL_MS).toBe(100);
    expect(gravityIntervalMs(90)).toBe(100);
    expect(gravityIntervalMs(200)).toBe(100);
  });
});
