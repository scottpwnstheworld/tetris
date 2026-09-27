import { describe, expect, it } from "vitest";
import { addLineClearScore, pointsForLineClear } from "../src/score.js";

describe("pointsForLineClear with level", () => {
  it("matches flat guideline values at level 1", () => {
    expect(pointsForLineClear(1, 1)).toBe(100);
    expect(pointsForLineClear(2, 1)).toBe(300);
    expect(pointsForLineClear(3, 1)).toBe(500);
    expect(pointsForLineClear(4, 1)).toBe(800);
  });

  it("multiplies awards by the active level", () => {
    expect(pointsForLineClear(1, 2)).toBe(200);
    expect(pointsForLineClear(2, 3)).toBe(900);
    expect(pointsForLineClear(4, 4)).toBe(3200);
  });

  it("awards no points for zero lines regardless of level", () => {
    expect(pointsForLineClear(0, 5)).toBe(0);
  });

  it("treats non-positive levels as level 1", () => {
    expect(pointsForLineClear(1, 0)).toBe(100);
    expect(pointsForLineClear(4, -2)).toBe(800);
  });
});

describe("addLineClearScore with level", () => {
  it("adds level-scaled line awards to the running total", () => {
    expect(addLineClearScore(50, 1, 2)).toBe(250);
    expect(addLineClearScore(1000, 4, 3)).toBe(3400);
  });

  it("defaults to level 1 when level is omitted", () => {
    expect(addLineClearScore(0, 1)).toBe(100);
    expect(addLineClearScore(1200, 0)).toBe(1200);
  });
});
