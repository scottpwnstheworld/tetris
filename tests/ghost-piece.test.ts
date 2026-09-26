import { describe, expect, it } from "vitest";
import { createEmptyPlayfield } from "../src/playfield.js";
import { getPieceCells, spawnPiece } from "../src/piece.js";
import { createGameState } from "../src/game.js";
import {
  moveActivePiece,
  rotateActivePieceCounterClockwise,
} from "../src/input.js";
import { computeGhostPiece } from "../src/ghost.js";

function lowestPoseAfterSoftDrops(state: ReturnType<typeof createGameState>) {
  let current = state;
  for (let i = 0; i < 25; i += 1) {
    const next = moveActivePiece(current, 0, 1);
    const beforeY = current.piece?.y ?? -1;
    const afterY = next.piece?.y ?? -1;
    if (afterY === beforeY) {
      break;
    }
    current = next;
  }
  return current.piece;
}

describe("computeGhostPiece", () => {
  it("returns null when there is no active piece", () => {
    const grid = createEmptyPlayfield();
    const state = { grid, piece: null, nextPiece: "O" as const };
    expect(computeGhostPiece(state)).toBeNull();
  });

  it("matches the pose after repeated soft drops on an empty board", () => {
    const state = createGameState("T", "O");
    const ghost = computeGhostPiece(state);
    const landed = lowestPoseAfterSoftDrops(state);

    expect(ghost).not.toBeNull();
    expect(ghost).toEqual(landed);
  });

  it("moves horizontally with the active piece", () => {
    const state = createGameState("T", "O");
    const shifted = moveActivePiece(state, -2, 0);
    const ghost = computeGhostPiece(shifted);

    expect(ghost).not.toBeNull();
    expect(ghost!.x).toBe(shifted.piece!.x);
    expect(ghost!.y).toBeGreaterThan(shifted.piece!.y);
    expect(getPieceCells(ghost!)).not.toEqual(getPieceCells(shifted.piece!));
  });

  it("lands on top of locked cells instead of overlapping them", () => {
    const grid = createEmptyPlayfield();
    for (let x = 2; x <= 6; x += 1) {
      grid[18][x] = "locked";
    }
    const piece = spawnPiece("T");
    const state = { grid, piece, nextPiece: "O" as const };
    const ghost = computeGhostPiece(state);

    expect(ghost).not.toBeNull();
    for (const { x, y } of getPieceCells(ghost!)) {
      expect(grid[y][x]).not.toBe("locked");
      expect(y).toBeLessThan(18);
    }
    const activeCells = getPieceCells(piece);
    const ghostCells = getPieceCells(ghost!);
    expect(Math.max(...ghostCells.map((c) => c.y))).toBe(17);
    expect(Math.min(...activeCells.map((c) => c.y))).toBe(0);
  });

  it("uses the active piece rotation when projecting the ghost", () => {
    const state = createGameState("T", "O");
    const rotated = rotateActivePieceCounterClockwise(state);
    const ghost = computeGhostPiece(rotated);

    expect(ghost).not.toBeNull();
    expect(ghost!.rotation).toBe(rotated.piece!.rotation);
    expect(getPieceCells(ghost!)).toEqual(
      getPieceCells({ ...rotated.piece!, y: ghost!.y }),
    );
  });
});
