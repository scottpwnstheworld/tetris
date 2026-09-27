import { describe, expect, it } from "vitest";
import { createGameState, hardDrop } from "../src/game.js";
import { moveActivePiece } from "../src/input.js";

function cellsMovedBySoftDrop(state: ReturnType<typeof createGameState>): number {
  const startY = state.piece!.y;
  let current = state;
  for (let i = 0; i < 25; i += 1) {
    const next = moveActivePiece(current, 0, 1);
    if (next.piece!.y === current.piece!.y) {
      break;
    }
    current = next;
  }
  return current.piece!.y - startY;
}

describe("hardDrop cellsDropped", () => {
  it("reports how many rows the active piece fell before locking", () => {
    const before = createGameState("T", "O");
    const result = hardDrop(before);

    expect(result.cellsDropped).toBe(cellsMovedBySoftDrop(before));
    expect(result.cellsDropped).toBeGreaterThan(0);
  });

  it("reports zero cells when there is no active piece", () => {
    const before = createGameState("T", "O");
    const ended = { ...before, piece: null };
    const result = hardDrop(ended);

    expect(result.cellsDropped).toBe(0);
  });
});
