import { describe, expect, it } from "vitest";
import {
  PLAYFIELD_COLS,
  PLAYFIELD_ROWS,
  createEmptyPlayfield,
  isInsidePlayfield,
} from "../src/playfield.js";

describe("playfield", () => {
  it("uses standard Tetris dimensions", () => {
    expect(PLAYFIELD_COLS).toBe(10);
    expect(PLAYFIELD_ROWS).toBe(20);
  });

  it("creates a grid of empty cells", () => {
    const grid = createEmptyPlayfield();
    expect(grid).toHaveLength(PLAYFIELD_ROWS);
    for (const row of grid) {
      expect(row).toHaveLength(PLAYFIELD_COLS);
      expect(row.every((cell) => cell === null)).toBe(true);
    }
  });

  it("treats in-bounds coordinates as inside the playfield", () => {
    expect(isInsidePlayfield(0, 0)).toBe(true);
    expect(isInsidePlayfield(9, 19)).toBe(true);
  });

  it("treats out-of-bounds coordinates as outside the playfield", () => {
    expect(isInsidePlayfield(-1, 0)).toBe(false);
    expect(isInsidePlayfield(10, 0)).toBe(false);
    expect(isInsidePlayfield(0, 20)).toBe(false);
  });
});
