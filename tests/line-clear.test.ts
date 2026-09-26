import { describe, expect, it } from "vitest";
import {
  createEmptyPlayfield,
  PLAYFIELD_COLS,
  type Playfield,
} from "../src/playfield.js";
import { clearFullLines } from "../src/lines.js";

function fullRow(): Playfield[number] {
  return Array.from({ length: PLAYFIELD_COLS }, () => "locked" as const);
}

describe("clearFullLines", () => {
  it("returns zero cleared lines and an empty playfield when no cells are locked", () => {
    const grid = createEmptyPlayfield();
    const result = clearFullLines(grid);

    expect(result.linesCleared).toBe(0);
    expect(result.grid.every((row) => row.every((cell) => cell === null))).toBe(true);
  });

  it("does not mutate the input playfield", () => {
    const grid = createEmptyPlayfield();
    grid[19] = fullRow();
    const before = grid.map((row) => row.slice());
    clearFullLines(grid);

    expect(grid).toEqual(before);
  });

  it("leaves the grid unchanged when a row has a gap", () => {
    const partial = fullRow();
    partial[4] = null;
    const grid = createEmptyPlayfield();
    grid[10] = partial;
    const result = clearFullLines(grid);

    expect(result.linesCleared).toBe(0);
    expect(result.grid[10]).toEqual(partial);
  });

  it("removes a single full bottom row and pads empty rows at the top", () => {
    const grid = createEmptyPlayfield();
    grid[19] = fullRow();
    const result = clearFullLines(grid);

    expect(result.linesCleared).toBe(1);
    expect(result.grid.every((row) => row.every((cell) => cell === null))).toBe(true);
  });

  it("drops rows above a cleared line and keeps partial rows at the bottom", () => {
    const marker = Array.from({ length: PLAYFIELD_COLS }, () => null as const);
    marker[0] = "locked";
    const grid = createEmptyPlayfield();
    grid[18] = marker;
    grid[19] = fullRow();
    const result = clearFullLines(grid);

    expect(result.linesCleared).toBe(1);
    expect(result.grid[19]).toEqual(marker);
    expect(result.grid[18].every((cell) => cell === null)).toBe(true);
  });

  it("clears multiple adjacent full rows in one pass", () => {
    const marker = Array.from({ length: PLAYFIELD_COLS }, () => null as const);
    marker[9] = "locked";
    const grid = createEmptyPlayfield();
    grid[17] = marker;
    grid[18] = fullRow();
    grid[19] = fullRow();
    const result = clearFullLines(grid);

    expect(result.linesCleared).toBe(2);
    expect(result.grid[19]).toEqual(marker);
    expect(result.grid[18].every((cell) => cell === null)).toBe(true);
    expect(result.grid[17].every((cell) => cell === null)).toBe(true);
  });

  it("clears several non-adjacent full rows while preserving gaps between them", () => {
    const gap = Array.from({ length: PLAYFIELD_COLS }, () => null as const);
    gap[3] = "locked";
    const grid = createEmptyPlayfield();
    grid[17] = fullRow();
    grid[18] = gap;
    grid[19] = fullRow();
    const result = clearFullLines(grid);

    expect(result.linesCleared).toBe(2);
    expect(result.grid[19]).toEqual(gap);
    expect(result.grid[18].every((cell) => cell === null)).toBe(true);
  });

  it("returns a new grid reference when lines are cleared", () => {
    const grid = createEmptyPlayfield();
    grid[19] = fullRow();
    const result = clearFullLines(grid);

    expect(result.grid).not.toBe(grid);
  });
});
