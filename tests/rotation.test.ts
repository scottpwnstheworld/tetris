import { describe, expect, it } from "vitest";
import { createEmptyPlayfield, type Playfield } from "../src/playfield.js";
import {
  getPieceCells,
  spawnPiece,
  type ActivePiece,
} from "../src/piece.js";
import { tryRotate } from "../src/rotation.js";

function playfieldWithLocked(cells: ReadonlyArray<readonly [number, number]>): Playfield {
  const grid = createEmptyPlayfield();
  for (const [x, y] of cells) {
    grid[y][x] = "locked";
  }
  return grid;
}

function expectCells(piece: ActivePiece, expected: ReadonlyArray<readonly [number, number]>) {
  const cells = getPieceCells(piece);
  expect(cells).toHaveLength(expected.length);
  for (const [x, y] of expected) {
    expect(cells).toContainEqual({ x, y });
  }
}

describe("tryRotate", () => {
  const grid = createEmptyPlayfield();

  it("rotates the T tetromino clockwise from its spawn pose", () => {
    const piece = spawnPiece("T");
    const rotated = tryRotate(piece, grid, "cw");

    expect(rotated).not.toBeNull();
    expect(rotated!.kind).toBe("T");
    expectCells(rotated!, [
      [4, 0],
      [3, 1],
      [4, 1],
      [5, 1],
    ]);
  });

  it("rotates the T tetromino counter-clockwise from its spawn pose", () => {
    const piece = spawnPiece("T");
    const rotated = tryRotate(piece, grid, "ccw");

    expect(rotated).not.toBeNull();
    expectCells(rotated!, [
      [3, 0],
      [4, 0],
      [4, 1],
      [5, 1],
    ]);
  });

  it("returns to the spawn pose after four clockwise rotations", () => {
    let piece = spawnPiece("T");
    for (let i = 0; i < 4; i++) {
      const next = tryRotate(piece, grid, "cw");
      expect(next).not.toBeNull();
      piece = next!;
    }

    expect(piece).toEqual(spawnPiece("T"));
    expectCells(piece, [
      [3, 0],
      [4, 0],
      [5, 0],
      [4, 1],
    ]);
  });

  it("applies a wall kick when a clockwise I rotation would leave the playfield", () => {
    const piece: ActivePiece = { kind: "I", x: 5, y: 0, rotation: 0 };
    const rotated = tryRotate(piece, grid, "cw");

    expect(rotated).not.toBeNull();
    expectCells(rotated!, [
      [7, 0],
      [7, 1],
      [7, 2],
      [7, 3],
    ]);
  });

  it("rejects rotation when the footprint and kicks collide with locked cells", () => {
    const blocked = playfieldWithLocked([[4, 1]]);
    const piece = spawnPiece("T");

    expect(tryRotate(piece, blocked, "ccw")).toBeNull();
  });

  it("does not mutate the piece or grid when rotation is rejected", () => {
    const piece = spawnPiece("T");
    const blocked = playfieldWithLocked([[4, 1]]);
    const beforeCells = getPieceCells(piece);
    const gridSnapshot = blocked.map((row) => row.slice());

    tryRotate(piece, blocked, "ccw");

    expect(getPieceCells(piece)).toEqual(beforeCells);
    expect(blocked).toEqual(gridSnapshot);
  });
});
