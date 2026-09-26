import { describe, expect, it } from "vitest";
import {
  createEmptyPlayfield,
  PLAYFIELD_COLS,
  type Playfield,
} from "../src/playfield.js";
import { getPieceCells, spawnPiece, type PieceKind } from "../src/piece.js";
import { createGameState, tickGravity, type GameState } from "../src/game.js";

function fullRow(): Playfield[number] {
  return Array.from({ length: PLAYFIELD_COLS }, () => "locked" as const);
}

function playfieldWithLocked(cells: ReadonlyArray<readonly [number, number]>): Playfield {
  const grid = createEmptyPlayfield();
  for (const [x, y] of cells) {
    grid[y][x] = "locked";
  }
  return grid;
}

describe("createGameState", () => {
  it("starts on an empty playfield with the active piece at its spawn pose", () => {
    const state = createGameState("T", "O");

    expect(state.nextPiece).toBe("O");
    expect(state.grid.every((row) => row.every((cell) => cell === null))).toBe(true);
    expect(state.piece).toEqual(spawnPiece("T"));
  });
});

describe("tickGravity", () => {
  it("moves the active piece down one row when space is clear", () => {
    const before = createGameState("T", "O");
    const { state, linesCleared, gameOver } = tickGravity(before);

    expect(gameOver).toBe(false);
    expect(linesCleared).toBe(0);
    expect(state.piece).not.toBeNull();
    expect(state.piece!.y).toBe(before.piece!.y + 1);
    expect(state.piece!.kind).toBe("T");
    expect(state.nextPiece).toBe("O");
  });

  it("returns new state without mutating the input", () => {
    const before = createGameState("I", "T");
    const snapshot = before.grid.map((row) => row.slice());
    const pieceSnapshot = { ...before.piece! };
    tickGravity(before);

    expect(before.grid).toEqual(snapshot);
    expect(before.piece).toEqual(pieceSnapshot);
  });

  it("locks the piece, clears full lines, and spawns the queued next kind", () => {
    const grid = createEmptyPlayfield();
    grid[19] = fullRow();
    const onFloor = { ...spawnPiece("I"), x: 3, y: 19 };
    const before: GameState = { grid, piece: onFloor, nextPiece: "I" };

    const { state, linesCleared, gameOver } = tickGravity(before);

    expect(gameOver).toBe(false);
    expect(linesCleared).toBe(1);
    expect(state.grid.every((row) => row.every((cell) => cell === null))).toBe(true);
    expect(state.piece).toEqual(spawnPiece("I"));
    expect(state.nextPiece).toBe("I");
  });

  it("reports zero lines cleared when a lock does not complete a full row", () => {
    const onFloor = { ...spawnPiece("O"), x: 4, y: 18 };
    const before: GameState = {
      grid: createEmptyPlayfield(),
      piece: onFloor,
      nextPiece: "T",
    };

    const { state, linesCleared, gameOver } = tickGravity(before);

    expect(gameOver).toBe(false);
    expect(linesCleared).toBe(0);
    expect(state.piece).toEqual(spawnPiece("T"));
    for (const { x, y } of getPieceCells(onFloor)) {
      expect(state.grid[y][x]).toBe("locked");
    }
  });

  it("declares game over when the next piece cannot fit at spawn", () => {
    const grid = playfieldWithLocked([
      [3, 0],
      [4, 0],
      [5, 0],
      [4, 1],
    ]);
    const onFloor = { ...spawnPiece("O"), x: 4, y: 18 };
    const before: GameState = { grid, piece: onFloor, nextPiece: "T" };

    const { state, linesCleared, gameOver } = tickGravity(before);

    expect(gameOver).toBe(true);
    expect(linesCleared).toBe(0);
    expect(state.piece).toBeNull();
    expect(state.nextPiece).toBe("T");
    for (const { x, y } of getPieceCells(onFloor)) {
      expect(state.grid[y][x]).toBe("locked");
    }
  });

  it("does not mutate the input playfield when locking and respawning", () => {
    const onFloor = { ...spawnPiece("O"), x: 4, y: 18 };
    const grid = createEmptyPlayfield();
    const before: GameState = { grid, piece: onFloor, nextPiece: "L" };
    const gridSnapshot = grid.map((row) => row.slice());

    tickGravity(before);

    expect(grid).toEqual(gridSnapshot);
  });

  it("accepts any standard next piece kind on respawn", () => {
    const kinds: PieceKind[] = ["I", "O", "T", "S", "Z", "J", "L"];
    for (const next of kinds) {
      const onFloor = { ...spawnPiece("O"), x: 4, y: 18 };
      const before: GameState = {
        grid: createEmptyPlayfield(),
        piece: onFloor,
        nextPiece: next,
      };
      const { state, gameOver } = tickGravity(before);
      expect(gameOver).toBe(false);
      expect(state.piece).toEqual(spawnPiece(next));
    }
  });
});
