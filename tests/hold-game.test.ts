import { describe, expect, it } from "vitest";
import { createBagState, takeFromBag } from "../src/bag.js";
import { spawnPiece } from "../src/piece.js";
import { createGameState, tickGravity, type GameState } from "../src/game.js";
import { swapHold } from "../src/hold.js";

describe("hold with gravity lock", () => {
  it("clears holdLocked after a lock so the player can hold again", () => {
    let state: GameState = {
      ...createGameState("T", "O"),
      holdPiece: null,
      holdLocked: false,
    };
    state = swapHold(state);
    expect(state.holdLocked).toBe(true);

    const onFloor = { ...spawnPiece("O"), x: 3, y: 18 };
    const { state: afterLock } = tickGravity({ ...state, piece: onFloor });

    expect(afterLock.holdLocked).toBe(false);
    expect(afterLock.holdPiece).toBe("T");
  });

  it("preserves holdPiece across lock and respawn when using the bag queue", () => {
    const first = takeFromBag(createBagState(3));
    const second = takeFromBag(first.bag);
    let state: GameState = {
      ...createGameState(first.kind, second.kind, second.bag),
      holdPiece: null,
      holdLocked: false,
    };
    state = swapHold(state);
    expect(state.holdPiece).toBe(first.kind);

    const onFloor = { ...spawnPiece(second.kind), x: 3, y: 18 };
    const { state: afterLock } = tickGravity({ ...state, piece: onFloor });

    expect(afterLock.holdPiece).toBe(first.kind);
    expect(afterLock.holdLocked).toBe(false);
  });
});
