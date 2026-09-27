import { describe, expect, it } from "vitest";
import { createEmptyPlayfield } from "../src/playfield.js";
import { spawnPiece } from "../src/piece.js";
import {
  createPlaySession,
  handlePlayAction,
  handlePlayKey,
  restartPlaySession,
  stepPlayGravity,
  type PlaySession,
} from "../src/session.js";

describe("handlePlayKey soft-drop score", () => {
  it("adds one point when ArrowDown moves the piece one row", () => {
    const before = createPlaySession();
    const after = handlePlayKey(before, "ArrowDown");

    expect(after.state.piece!.y).toBe(before.state.piece!.y + 1);
    expect(after.score).toBe(1);
  });

  it("does not change score when soft drop is blocked at the floor", () => {
    const grid = createEmptyPlayfield();
    const onFloor = { ...spawnPiece("O"), x: 4, y: 19 };
    const before: PlaySession = {
      state: { grid, piece: onFloor, nextPiece: "T" },
      gameOver: false,
      score: 50,
      totalLinesCleared: 0,
      paused: false,
    };

    const after = handlePlayKey(before, "ArrowDown");

    expect(after.state.piece!.y).toBe(19);
    expect(after.score).toBe(50);
  });

  it("accumulates soft-drop points across repeated ArrowDown presses", () => {
    let session = createPlaySession();
    session = handlePlayKey(session, "ArrowDown");
    session = handlePlayKey(session, "ArrowDown");
    session = handlePlayKey(session, "ArrowDown");

    expect(session.score).toBe(3);
  });

  it("does not award soft-drop points for lateral movement", () => {
    const before = createPlaySession();
    const after = handlePlayKey(before, "ArrowLeft");

    expect(after.score).toBe(0);
  });
});

describe("handlePlayAction move-down score", () => {
  it("matches ArrowDown scoring for touch move-down", () => {
    const before = createPlaySession();
    const fromKey = handlePlayKey(before, "ArrowDown");
    const fromTouch = handlePlayAction(before, "move-down");

    expect(fromTouch.score).toBe(fromKey.score);
    expect(fromTouch.score).toBe(1);
  });
});

describe("soft-drop score vs gravity", () => {
  it("does not add soft-drop points on automatic gravity ticks", () => {
    const before = createPlaySession();
    const after = stepPlayGravity(before);

    expect(after.score).toBe(0);
  });
});

describe("restart after soft-drop scoring", () => {
  it("resets score after game over restart", () => {
    const scored: PlaySession = {
      ...createPlaySession(),
      score: 12,
      gameOver: true,
      state: {
        grid: createEmptyPlayfield(),
        piece: null,
        nextPiece: "T",
      },
    };

    const restarted = restartPlaySession(scored);
    expect(restarted.score).toBe(0);
    expect(restarted.gameOver).toBe(false);
  });
});
