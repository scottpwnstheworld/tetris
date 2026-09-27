import { describe, expect, it } from "vitest";
import { createEmptyPlayfield } from "../src/playfield.js";
import { spawnPiece } from "../src/piece.js";
import { createGameState } from "../src/game.js";
import { moveActivePiece } from "../src/input.js";
import {
  createPlaySession,
  handlePlayAction,
  restartPlaySession,
  stepPlayGravity,
  type PlaySession,
} from "../src/session.js";
import { pointsForHardDropCells } from "../src/score.js";

function expectedHardDropCellsFrom(state: ReturnType<typeof createGameState>): number {
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

function sessionWithLineClearSetup(): PlaySession {
  const grid = createEmptyPlayfield();
  for (let x = 0; x < 10; x += 1) {
    if (x !== 4) {
      grid[19][x] = "locked";
    }
  }
  const onFloor = { ...spawnPiece("I"), x: 3, y: 19 };
  return {
    state: { grid, piece: onFloor, nextPiece: "T" },
    gameOver: false,
    score: 0,
    totalLinesCleared: 0,
    paused: false,
  };
}

describe("handlePlayAction hard-drop score", () => {
  it("adds hard-drop cell points when the drop does not clear lines", () => {
    const before = createPlaySession();
    const cells = expectedHardDropCellsFrom(before.state);
    const after = handlePlayAction(before, "hard-drop");

    expect(after.linesCleared).toBe(0);
    expect(after.score).toBe(pointsForHardDropCells(cells));
    expect(after.score).toBeGreaterThan(0);
  });

  it("adds hard-drop and line-clear points together", () => {
    const grid = createEmptyPlayfield();
    for (let x = 0; x < 10; x += 1) {
      if (x !== 4) {
        grid[19][x] = "locked";
      }
    }
    const floating = { ...spawnPiece("I"), x: 2, y: 0, rotation: 1 };
    const before: PlaySession = {
      state: { grid, piece: floating, nextPiece: "T" },
      gameOver: false,
      score: 50,
      totalLinesCleared: 0,
      paused: false,
    };
    const cells = expectedHardDropCellsFrom(before.state);
    const after = handlePlayAction(before, "hard-drop");

    expect(after.linesCleared).toBe(1);
    expect(after.score).toBe(50 + 100 + pointsForHardDropCells(cells));
    expect(cells).toBeGreaterThan(0);
  });

  it("does not award hard-drop points on automatic gravity ticks", () => {
    const before = createPlaySession();
    const after = stepPlayGravity(before);

    expect(after.score).toBe(0);
  });

  it("does not change score when hard-drop is blocked while paused", () => {
    const paused: PlaySession = { ...createPlaySession(), paused: true, score: 40 };
    const after = handlePlayAction(paused, "hard-drop");

    expect(after).toBe(paused);
    expect(after.score).toBe(40);
  });
});

describe("line-clear hard-drop score regression", () => {
  it("still awards only line points when the piece cannot fall further", () => {
    const before = sessionWithLineClearSetup();
    const after = handlePlayAction(before, "hard-drop");

    expect(after.linesCleared).toBe(1);
    expect(after.score).toBe(100);
  });
});

describe("restart after hard-drop scoring", () => {
  it("resets score after game over restart", () => {
    const scored: PlaySession = {
      ...createPlaySession(),
      score: 88,
      gameOver: true,
      state: {
        grid: createEmptyPlayfield(),
        piece: null,
        nextPiece: "T",
      },
    };

    const restarted = restartPlaySession(scored);
    expect(restarted.score).toBe(0);
  });
});
