import { describe, expect, it } from "vitest";
import {
  addHardDropScore,
  pointsForHardDropCells,
} from "../src/score.js";

describe("pointsForHardDropCells", () => {
  it("awards no points when zero cells are hard-dropped", () => {
    expect(pointsForHardDropCells(0)).toBe(0);
  });

  it("awards two points per cell moved by hard drop", () => {
    expect(pointsForHardDropCells(1)).toBe(2);
    expect(pointsForHardDropCells(5)).toBe(10);
  });
});

describe("addHardDropScore", () => {
  it("returns the same total when no cells hard-drop", () => {
    expect(addHardDropScore(400, 0)).toBe(400);
  });

  it("adds hard-drop points to the running total", () => {
    expect(addHardDropScore(0, 3)).toBe(6);
    expect(addHardDropScore(100, 2)).toBe(104);
  });
});
