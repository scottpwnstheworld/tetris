import { describe, expect, it } from "vitest";
import { createEmptyPlayfield, type Playfield } from "../src/playfield.js";
import { getPieceCells, spawnPiece, type PieceKind } from "../src/piece.js";
import { createGameState, type GameState } from "../src/game.js";
import { moveActivePiece } from "../src/input.js";

function playfieldWithLocked(cells: ReadonlyArray<readonly [number, number]>): Playfield {
  const grid = createEmptyPlayfield();
  for (const [x, y] of cells) {
    grid[y][x] = "locked";
  }
  return grid;
}

describe("moveActivePiece", () => {
  it("moves the active piece left when space is clear", () => {
    const before = createGameState("T", "O");
    const after = moveActivePiece(before, -1, 0);

    expect(after.piece!.x).toBe(before.piece!.x - 1);
    expect(after.piece!.y).toBe(before.piece!.y);
    expect(after.piece!.kind).toBe("T");
    expect(after.nextPiece).toBe("O");
  });

  it("moves the active piece right when space is clear", () => {
    const before = createGameState("T", "O");
    const after = moveActivePiece(before, 1, 0);

    expect(after.piece!.x).toBe(before.piece!.x + 1);
    expect(after.piece!.kind).toBe("T");
  });

  it("leaves the playfield unchanged on a successful move", () => {
    const before = createGameState("I", "T");
    const after = moveActivePiece(before, 0, 1);

    expect(after.grid).toBe(before.grid);
    expect(after.piece!.y).toBe(before.piece!.y + 1);
  });

  it("rejects a move into the left wall and keeps the piece pose", () => {
    const piece = { ...spawnPiece("I"), x: 0, y: 0 };
    const before: GameState = {
      grid: createEmptyPlayfield(),
      piece,
      nextPiece: "O",
    };

    const after = moveActivePiece(before, -1, 0);

    expect(after.piece).toEqual(piece);
    expect(after.nextPiece).toBe("O");
  });

  it("rejects a move into locked cells", () => {
    const grid = playfieldWithLocked([[4, 1]]);
    const before: GameState = {
      grid,
      piece: spawnPiece("T"),
      nextPiece: "L",
    };

    const after = moveActivePiece(before, 0, 1);

    expect(after.piece).toEqual(before.piece);
    expect(after.grid).toBe(grid);
  });

  it("returns the same state when there is no active piece", () => {
    const before: GameState = {
      grid: createEmptyPlayfield(),
      piece: null,
      nextPiece: "T",
    };

    const after = moveActivePiece(before, 1, 0);

    expect(after).toBe(before);
  });

  it("does not mutate the input state", () => {
    const before = createGameState("O", "S");
    const gridSnapshot = before.grid.map((row) => row.slice());
    const pieceSnapshot = { ...before.piece! };

    moveActivePiece(before, 1, 0);

    expect(before.grid).toEqual(gridSnapshot);
    expect(before.piece).toEqual(pieceSnapshot);
    expect(before.nextPiece).toBe("S");
  });

  it("accepts horizontal moves for any standard piece kind at spawn", () => {
    const kinds: PieceKind[] = ["I", "O", "T", "S", "Z", "J", "L"];
    for (const kind of kinds) {
      const before = createGameState(kind, "I");
      const after = moveActivePiece(before, 1, 0);
      expect(after.piece!.kind).toBe(kind);
      expect(after.piece!.x).toBe(before.piece!.x + 1);
      for (const { x, y } of getPieceCells(after.piece!)) {
        expect(after.grid[y][x]).toBeNull();
      }
    }
  });
});
