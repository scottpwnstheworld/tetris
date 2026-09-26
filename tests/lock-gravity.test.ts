import { describe, expect, it } from "vitest";
import { createEmptyPlayfield, type Playfield } from "../src/playfield.js";
import {
  getPieceCells,
  spawnPiece,
  type ActivePiece,
} from "../src/piece.js";
import { lockPiece, stepDown } from "../src/gravity.js";

function playfieldWithLocked(cells: ReadonlyArray<readonly [number, number]>): Playfield {
  const grid = createEmptyPlayfield();
  for (const [x, y] of cells) {
    grid[y][x] = "locked";
  }
  return grid;
}

describe("lockPiece", () => {
  it("writes a locked sentinel on every cell occupied by the piece", () => {
    const piece = spawnPiece("T");
    const grid = createEmptyPlayfield();
    const locked = lockPiece(piece, grid);

    for (const { x, y } of getPieceCells(piece)) {
      expect(locked[y][x]).toBe("locked");
    }
  });

  it("returns a new grid without mutating the input playfield", () => {
    const piece = spawnPiece("I");
    const grid = createEmptyPlayfield();
    const locked = lockPiece(piece, grid);

    expect(locked).not.toBe(grid);
    expect(grid.every((row) => row.every((cell) => cell === null))).toBe(true);
  });

  it("preserves existing locked cells outside the piece footprint", () => {
    const grid = playfieldWithLocked([[0, 19]]);
    const piece = spawnPiece("O");
    const locked = lockPiece(piece, grid);

    expect(locked[19][0]).toBe("locked");
    for (const { x, y } of getPieceCells(piece)) {
      expect(locked[y][x]).toBe("locked");
    }
  });
});

describe("stepDown", () => {
  it("moves the active piece down one row when space is clear", () => {
    const piece = spawnPiece("T");
    const grid = createEmptyPlayfield();
    const result = stepDown(piece, grid);

    expect(result.piece).not.toBeNull();
    expect(result.piece!.y).toBe(piece.y + 1);
    expect(result.piece!.x).toBe(piece.x);
    expect(result.piece!.kind).toBe(piece.kind);
  });

  it("leaves the playfield unchanged when the piece moves down", () => {
    const piece = spawnPiece("T");
    const grid = createEmptyPlayfield();
    const before = grid.map((row) => row.slice());
    stepDown(piece, grid);

    expect(grid).toEqual(before);
  });

  it("locks the piece and clears the active piece when blocked by the floor", () => {
    const onFloor: ActivePiece = { ...spawnPiece("O"), x: 4, y: 18 };
    const grid = createEmptyPlayfield();
    const result = stepDown(onFloor, grid);

    expect(result.piece).toBeNull();
    for (const { x, y } of getPieceCells(onFloor)) {
      expect(result.grid[y][x]).toBe("locked");
    }
  });

  it("locks the piece when downward movement is blocked by locked cells", () => {
    const piece = spawnPiece("T");
    const grid = playfieldWithLocked([[4, 2]]);
    const result = stepDown(piece, grid);

    expect(result.piece).toBeNull();
    for (const { x, y } of getPieceCells(piece)) {
      expect(result.grid[y][x]).toBe("locked");
    }
  });

  it("does not mutate the input playfield when locking", () => {
    const onFloor: ActivePiece = { ...spawnPiece("O"), x: 4, y: 18 };
    const grid = createEmptyPlayfield();
    const before = grid.map((row) => row.slice());
    stepDown(onFloor, grid);

    expect(grid).toEqual(before);
  });
});
