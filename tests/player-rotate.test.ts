import { describe, expect, it } from "vitest";
import { createEmptyPlayfield, type Playfield } from "../src/playfield.js";
import { getPieceCells, spawnPiece, type PieceKind } from "../src/piece.js";
import { createGameState, type GameState } from "../src/game.js";
import { rotateActivePiece } from "../src/input.js";

function playfieldWithLocked(cells: ReadonlyArray<readonly [number, number]>): Playfield {
  const grid = createEmptyPlayfield();
  for (const [x, y] of cells) {
    grid[y][x] = "locked";
  }
  return grid;
}

describe("rotateActivePiece", () => {
  it("rotates the active piece clockwise when space is clear", () => {
    const before = createGameState("T", "O");
    const after = rotateActivePiece(before, "cw");

    expect(after.piece!.kind).toBe("T");
    expect(after.nextPiece).toBe("O");
    expect(getPieceCells(after.piece!)).toContainEqual({ x: 4, y: 0 });
    expect(getPieceCells(after.piece!)).toContainEqual({ x: 4, y: 1 });
  });

  it("leaves the playfield unchanged on a successful rotation", () => {
    const before = createGameState("T", "I");
    const after = rotateActivePiece(before, "cw");

    expect(after.grid).toBe(before.grid);
  });

  it("rejects rotation into locked cells and keeps the piece pose", () => {
    const grid = playfieldWithLocked([[4, 1]]);
    const before: GameState = {
      grid,
      piece: spawnPiece("T"),
      nextPiece: "L",
    };

    const after = rotateActivePiece(before, "ccw");

    expect(after.piece).toEqual(before.piece);
    expect(after.grid).toBe(grid);
  });

  it("returns the same state when there is no active piece", () => {
    const before: GameState = {
      grid: createEmptyPlayfield(),
      piece: null,
      nextPiece: "T",
    };

    const after = rotateActivePiece(before, "cw");

    expect(after).toBe(before);
  });

  it("does not mutate the input state", () => {
    const before = createGameState("O", "S");
    const gridSnapshot = before.grid.map((row) => row.slice());
    const pieceSnapshot = { ...before.piece! };

    rotateActivePiece(before, "cw");

    expect(before.grid).toEqual(gridSnapshot);
    expect(before.piece).toEqual(pieceSnapshot);
    expect(before.nextPiece).toBe("S");
  });

  it("accepts clockwise rotation for any standard piece kind at spawn", () => {
    const kinds: PieceKind[] = ["I", "O", "T", "S", "Z", "J", "L"];
    for (const kind of kinds) {
      const before = createGameState(kind, "I");
      const after = rotateActivePiece(before, "cw");
      expect(after.piece!.kind).toBe(kind);
      expect(getPieceCells(after.piece!)).toHaveLength(4);
      for (const { x, y } of getPieceCells(after.piece!)) {
        expect(after.grid[y][x]).toBeNull();
      }
    }
  });
});
