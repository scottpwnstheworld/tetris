import { describe, expect, it } from "vitest";
import {
  addSoftDropScore,
  pointsForSoftDropCells,
} from "../src/score.js";

describe("pointsForSoftDropCells", () => {
  it("awards no points when zero cells are soft-dropped", () => {
    expect(pointsForSoftDropCells(0)).toBe(0);
  });

  it("awards one point per cell moved by manual soft drop", () => {
    expect(pointsForSoftDropCells(1)).toBe(1);
    expect(pointsForSoftDropCells(5)).toBe(5);
  });
});

describe("addSoftDropScore", () => {
  it("returns the same total when no cells soft-drop", () => {
    expect(addSoftDropScore(400, 0)).toBe(400);
  });

  it("adds soft-drop points to the running total", () => {
    expect(addSoftDropScore(0, 3)).toBe(3);
    expect(addSoftDropScore(100, 2)).toBe(102);
  });
});
