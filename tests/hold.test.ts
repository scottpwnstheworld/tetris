import { describe, expect, it } from "vitest";
import { createBagState, takeFromBag } from "../src/bag.js";
import { createEmptyPlayfield } from "../src/playfield.js";
import { spawnPiece } from "../src/piece.js";
import { createGameState, type GameState } from "../src/game.js";
import { swapHold } from "../src/hold.js";

function withHold(
  state: GameState,
  holdPiece: GameState["holdPiece"],
  holdLocked: boolean,
): GameState {
  return { ...state, holdPiece, holdLocked };
}

describe("swapHold", () => {
  it("returns the same state when there is no active piece", () => {
    const ended: GameState = {
      grid: createEmptyPlayfield(),
      piece: null,
      nextPiece: "T",
      holdPiece: null,
      holdLocked: false,
    };
    expect(swapHold(ended)).toBe(ended);
  });

  it("returns the same state when hold is locked for the current piece", () => {
    const before = withHold(createGameState("T", "O"), null, true);
    expect(swapHold(before)).toBe(before);
  });

  it("stores the active kind in hold and promotes next on first hold", () => {
    const before = withHold(createGameState("T", "O"), null, false);
    const after = swapHold(before);

    expect(after.holdPiece).toBe("T");
    expect(after.holdLocked).toBe(true);
    expect(after.piece).toEqual(spawnPiece("O"));
    expect(after.nextPiece).toBe("O");
    expect(after.grid).toEqual(before.grid);
  });

  it("draws the following kind from the bag when holding with a seven-bag queue", () => {
    const first = takeFromBag(createBagState(12));
    const second = takeFromBag(first.bag);
    const third = takeFromBag(second.bag);
    const before = withHold(
      createGameState(first.kind, second.kind, second.bag),
      null,
      false,
    );

    const after = swapHold(before);

    expect(after.holdPiece).toBe(first.kind);
    expect(after.piece).toEqual(spawnPiece(second.kind));
    expect(after.nextPiece).toBe(third.kind);
    expect(after.bag).toEqual(third.bag);
    expect(after.holdLocked).toBe(true);
  });

  it("swaps the active piece with a filled hold slot without changing nextPiece", () => {
    const before = withHold(createGameState("T", "O"), "L", false);
    const after = swapHold(before);

    expect(after.holdPiece).toBe("T");
    expect(after.piece).toEqual(spawnPiece("L"));
    expect(after.nextPiece).toBe("O");
    expect(after.holdLocked).toBe(true);
  });

  it("rejects hold when the swapped-in piece cannot spawn on the grid", () => {
    const grid = createEmptyPlayfield();
    for (let x = 3; x <= 6; x += 1) {
      grid[0][x] = "locked";
      grid[1][x] = "locked";
    }
    const blocked: GameState = {
      grid,
      piece: spawnPiece("T"),
      nextPiece: "O",
      holdPiece: "I",
      holdLocked: false,
    };

    expect(swapHold(blocked)).toBe(blocked);
  });
});
