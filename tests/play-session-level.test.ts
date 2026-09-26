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
import { levelFromTotalLines } from "../src/gravity-speed.js";

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
  };
}

describe("createPlaySession totalLinesCleared", () => {
  it("starts with zero total lines cleared", () => {
    const session = createPlaySession();
    expect(session.totalLinesCleared).toBe(0);
    expect(levelFromTotalLines(session.totalLinesCleared)).toBe(1);
  });
});

describe("stepPlayGravity totalLinesCleared", () => {
  it("does not change total lines when gravity moves without locking", () => {
    const before = createPlaySession();
    const result = stepPlayGravity(before);

    expect(result.linesCleared).toBe(0);
    expect(result.totalLinesCleared).toBe(0);
  });

  it("adds cleared rows to the running total on lock", () => {
    const before = sessionWithLineClearSetup();
    const result = stepPlayGravity(before);

    expect(result.linesCleared).toBe(1);
    expect(result.totalLinesCleared).toBe(1);
  });

  it("accumulates total lines across successive clears", () => {
    const first = sessionWithLineClearSetup();
    const afterFirst = stepPlayGravity(first);
    expect(afterFirst.totalLinesCleared).toBe(1);

    const grid = afterFirst.state.grid;
    for (let x = 0; x < 10; x += 1) {
      if (x !== 3) {
        grid[19][x] = "locked";
      }
    }
    const secondPiece = { ...spawnPiece("I"), x: 2, y: 19 };
    const second: PlaySession = {
      ...afterFirst,
      state: { ...afterFirst.state, grid, piece: secondPiece },
    };

    const afterSecond = stepPlayGravity(second);
    expect(afterSecond.linesCleared).toBe(1);
    expect(afterSecond.totalLinesCleared).toBe(2);
  });
});

describe("handlePlayKey totalLinesCleared", () => {
  it("leaves total lines unchanged for movement and rotation", () => {
    const before = createPlaySession();
    const afterLeft = handlePlayKey(before, "ArrowLeft");
    const afterRotate = handlePlayKey(before, "ArrowUp");

    expect(afterLeft.totalLinesCleared).toBe(0);
    expect(afterRotate.totalLinesCleared).toBe(0);
  });
});

describe("handlePlayAction totalLinesCleared", () => {
  it("adds cleared rows on hard-drop", () => {
    const before = sessionWithLineClearSetup();
    const after = handlePlayAction(before, "hard-drop");

    expect(after.linesCleared).toBe(1);
    expect(after.totalLinesCleared).toBe(1);
  });

  it("does not change total lines on rotate-ccw", () => {
    const before = createPlaySession();
    const after = handlePlayAction(before, "rotate-ccw");
    expect(after.totalLinesCleared).toBe(0);
  });
});

describe("restartPlaySession totalLinesCleared", () => {
  it("resets total lines when restarting after game over", () => {
    const ended: PlaySession = {
      state: {
        grid: createEmptyPlayfield(),
        piece: null,
        nextPiece: "T",
      },
      gameOver: true,
      score: 500,
      totalLinesCleared: 25,
    };

    const restarted = restartPlaySession(ended);
    expect(restarted.gameOver).toBe(false);
    expect(restarted.totalLinesCleared).toBe(0);
    expect(restarted.score).toBe(0);
  });
});
