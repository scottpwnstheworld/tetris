import { describe, expect, it } from "vitest";
import { createEmptyPlayfield, type Playfield } from "../src/playfield.js";
import {
  getPieceCells,
  spawnPiece,
  type ActivePiece,
  type PieceKind,
} from "../src/piece.js";
import { tryMove } from "../src/movement.js";

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

describe("piece spawn", () => {
  it("spawns the I tetromino centered at the top row", () => {
    const piece = spawnPiece("I");
    expect(piece.kind).toBe("I");
    expectCells(piece, [
      [3, 0],
      [4, 0],
      [5, 0],
      [6, 0],
    ]);
  });

  it("spawns the O tetromino as a 2x2 block below the top edge", () => {
    const piece = spawnPiece("O");
    expect(piece.kind).toBe("O");
    expectCells(piece, [
      [4, 0],
      [5, 0],
      [4, 1],
      [5, 1],
    ]);
  });

  it("spawns the T tetromino in its default orientation", () => {
    const piece = spawnPiece("T");
    expect(piece.kind).toBe("T");
    expectCells(piece, [
      [3, 0],
      [4, 0],
      [5, 0],
      [4, 1],
    ]);
  });

  it("can spawn any of the seven standard kinds", () => {
    const kinds: PieceKind[] = ["I", "O", "T", "S", "Z", "J", "L"];
    for (const kind of kinds) {
      const piece = spawnPiece(kind);
      expect(piece.kind).toBe(kind);
      expect(getPieceCells(piece)).toHaveLength(4);
    }
  });
});

describe("movement and collision", () => {
  const grid = createEmptyPlayfield();

  it("moves an active piece down by one row when space is clear", () => {
    const piece = spawnPiece("T");
    const moved = tryMove(piece, grid, 0, 1);
    expect(moved).not.toBeNull();
    expectCells(moved!, [
      [3, 1],
      [4, 1],
      [5, 1],
      [4, 2],
    ]);
  });

  it("moves an active piece left and right when space is clear", () => {
    const piece = spawnPiece("T");
    const left = tryMove(piece, grid, -1, 0);
    expectCells(left!, [
      [2, 0],
      [3, 0],
      [4, 0],
      [3, 1],
    ]);
    const right = tryMove(piece, grid, 1, 0);
    expectCells(right!, [
      [4, 0],
      [5, 0],
      [6, 0],
      [5, 1],
    ]);
  });

  it("blocks horizontal movement against the left wall", () => {
    const piece = spawnPiece("I");
    const atWall: ActivePiece = { ...piece, x: 0, y: 0 };
    expectCells(atWall, [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ]);
    expect(tryMove(atWall, grid, -1, 0)).toBeNull();
  });

  it("blocks horizontal movement against the right wall", () => {
    const piece = spawnPiece("I");
    const atWall: ActivePiece = { ...piece, x: 6, y: 0 };
    expectCells(atWall, [
      [6, 0],
      [7, 0],
      [8, 0],
      [9, 0],
    ]);
    expect(tryMove(atWall, grid, 1, 0)).toBeNull();
  });

  it("blocks downward movement on the floor", () => {
    const piece = spawnPiece("O");
    const onFloor: ActivePiece = { ...piece, x: 4, y: 18 };
    expectCells(onFloor, [
      [4, 18],
      [5, 18],
      [4, 19],
      [5, 19],
    ]);
    expect(tryMove(onFloor, grid, 0, 1)).toBeNull();
  });

  it("blocks movement into locked cells on the playfield", () => {
    const piece = spawnPiece("T");
    const blocked = playfieldWithLocked([[4, 2]]);
    expect(tryMove(piece, blocked, 0, 1)).toBeNull();
  });

  it("does not mutate the original piece or grid when a move is rejected", () => {
    const piece = spawnPiece("I");
    const atWall: ActivePiece = { ...piece, x: 0, y: 0 };
    const before = getPieceCells(atWall);
    const snapshot = playfieldWithLocked([[0, 1]]);
    tryMove(atWall, snapshot, -1, 0);
    expect(getPieceCells(atWall)).toEqual(before);
    expect(snapshot[1][0]).toBe("locked");
  });
});
