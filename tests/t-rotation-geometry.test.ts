import { describe, expect, it } from "vitest";
import { createEmptyPlayfield } from "../src/playfield.js";
import {
  getPieceCells,
  spawnPiece,
  type ActivePiece,
} from "../src/piece.js";
import { tryRotate } from "../src/rotation.js";

function expectCells(piece: ActivePiece, expected: ReadonlyArray<readonly [number, number]>) {
  const cells = getPieceCells(piece);
  expect(cells).toHaveLength(expected.length);
  for (const [x, y] of expected) {
    expect(cells).toContainEqual({ x, y });
  }
}

function cellsKey(piece: ActivePiece): string {
  return getPieceCells(piece)
    .map(({ x, y }) => `${x},${y}`)
    .sort()
    .join("|");
}

/** T tetromino footprints at spawn anchor (3, 0) for rotations 0–3. */
const T_AT_SPAWN_BY_ROTATION: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  [
    [3, 0],
    [4, 0],
    [5, 0],
    [4, 1],
  ],
  [
    [4, 0],
    [3, 1],
    [4, 1],
    [5, 1],
  ],
  [
    [4, 0],
    [4, 1],
    [5, 1],
    [4, 2],
  ],
  [
    [4, 0],
    [3, 1],
    [4, 1],
    [4, 2],
  ],
];

describe("T tetromino rotation geometry", () => {
  const grid = createEmptyPlayfield();

  it("uses the standard T footprints at spawn for each rotation index", () => {
    for (let rotation = 0; rotation < 4; rotation++) {
      const piece: ActivePiece = { kind: "T", x: 3, y: 0, rotation };
      expectCells(piece, T_AT_SPAWN_BY_ROTATION[rotation]);
    }
  });

  it("does not share the Z spawn footprint after one counter-clockwise turn", () => {
    const rotated = tryRotate(spawnPiece("T"), grid, "ccw");
    expect(rotated).not.toBeNull();

    const zAtSpawn = spawnPiece("Z");
    expect(cellsKey(rotated!)).not.toBe(cellsKey(zAtSpawn));
  });

  it("counter-clockwise from spawn matches rotation index 3 (stem left)", () => {
    const rotated = tryRotate(spawnPiece("T"), grid, "ccw");
    expect(rotated).not.toBeNull();
    expect(rotated!.rotation).toBe(3);
    expectCells(rotated!, T_AT_SPAWN_BY_ROTATION[3]);
  });

  it("clockwise twice from spawn matches rotation index 2 (stem down)", () => {
    let piece = spawnPiece("T");
    piece = tryRotate(piece, grid, "cw")!;
    piece = tryRotate(piece, grid, "cw")!;

    expect(piece.rotation).toBe(2);
    expectCells(piece, T_AT_SPAWN_BY_ROTATION[2]);
  });

  it("keeps a 1-2-1 row fill for the left-facing rotation (not a Z stagger)", () => {
    const leftFacing: ActivePiece = { kind: "T", x: 3, y: 0, rotation: 3 };
    const rowCounts = new Map<number, number>();
    for (const { y } of getPieceCells(leftFacing)) {
      rowCounts.set(y, (rowCounts.get(y) ?? 0) + 1);
    }
    expect(rowCounts.get(0)).toBe(1);
    expect(rowCounts.get(1)).toBe(2);
    expect(rowCounts.get(2)).toBe(1);
    expect(rowCounts.size).toBe(3);
  });
});
