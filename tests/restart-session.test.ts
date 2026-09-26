import { describe, expect, it } from "vitest";
import { createEmptyPlayfield } from "../src/playfield.js";
import { spawnPiece } from "../src/piece.js";
import {
  createPlaySession,
  handlePlayAction,
  handlePlayKey,
  restartPlaySession,
  type PlaySession,
} from "../src/session.js";

function endedSession(overrides: Partial<PlaySession> = {}): PlaySession {
  const grid = createEmptyPlayfield();
  grid[18][3] = "locked";
  grid[18][4] = "locked";
  return {
    state: {
      grid,
      piece: null,
      nextPiece: "T",
    },
    gameOver: true,
    score: 500,
    ...overrides,
  };
}

describe("restartPlaySession", () => {
  it("returns the same session reference while the game is still in progress", () => {
    const active = createPlaySession();
    const after = restartPlaySession(active);

    expect(after).toBe(active);
  });

  it("starts a fresh playable session after game over with score reset and empty grid", () => {
    const ended = endedSession();
    const fresh = createPlaySession();
    const after = restartPlaySession(ended);

    expect(after.gameOver).toBe(false);
    expect(after.score).toBe(0);
    expect(after.state.piece).not.toBeNull();
    expect(after.state.grid.every((row) => row.every((cell) => cell === null))).toBe(
      true,
    );
    expect(after.state.piece!.kind).toBe(fresh.state.piece!.kind);
    expect(after.state.nextPiece).toBe(fresh.state.nextPiece);
    expect(after.state.bag).toEqual(fresh.state.bag);
  });
});

describe("handlePlayKey restart", () => {
  it("restarts on Enter after game over", () => {
    const ended = endedSession();
    const after = handlePlayKey(ended, "Enter");

    expect(after.gameOver).toBe(false);
    expect(after.score).toBe(0);
    expect(after.state.piece).toEqual(spawnPiece(after.state.piece!.kind));
  });

  it("ignores Enter during active play", () => {
    const before = createPlaySession();
    const after = handlePlayKey(before, "Enter");

    expect(after).toBe(before);
  });
});

describe("handlePlayAction restart", () => {
  it("restarts on the restart touch action after game over", () => {
    const ended = endedSession({ score: 800 });
    const after = handlePlayAction(ended, "restart");

    expect(after.gameOver).toBe(false);
    expect(after.score).toBe(0);
    expect(after.state.piece).not.toBeNull();
    if ("linesCleared" in after) {
      expect(after.linesCleared).toBe(0);
    }
  });

  it("does not restart the restart action while the game is active", () => {
    const before = createPlaySession();
    const after = handlePlayAction(before, "restart");

    expect(after).toBe(before);
  });
});
