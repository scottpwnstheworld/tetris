import { describe, expect, it } from "vitest";
import { addLineClearScore, pointsForLineClear } from "../src/score.js";

describe("pointsForLineClear", () => {
  it("awards no points when zero lines are cleared", () => {
    expect(pointsForLineClear(0)).toBe(0);
  });

  it("uses guideline single/double/triple/tetris values for one through four lines", () => {
    expect(pointsForLineClear(1)).toBe(100);
    expect(pointsForLineClear(2)).toBe(300);
    expect(pointsForLineClear(3)).toBe(500);
    expect(pointsForLineClear(4)).toBe(800);
  });
});

describe("addLineClearScore", () => {
  it("returns the same total when no lines clear", () => {
    expect(addLineClearScore(1200, 0)).toBe(1200);
  });

  it("adds the line-clear award to the running total", () => {
    expect(addLineClearScore(0, 1)).toBe(100);
    expect(addLineClearScore(250, 2)).toBe(550);
    expect(addLineClearScore(1000, 4)).toBe(1800);
  });
});
