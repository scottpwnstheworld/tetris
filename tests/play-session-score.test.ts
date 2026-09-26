import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createEmptyPlayfield } from "../src/playfield.js";
import { spawnPiece } from "../src/piece.js";
import {
  createPlaySession,
  handlePlayAction,
  handlePlayKey,
  stepPlayGravity,
  type PlaySession,
} from "../src/session.js";
import { formatScoreText } from "../src/render.js";

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
  };
}

describe("createPlaySession score", () => {
  it("starts with a zero score", () => {
    const session = createPlaySession();
    expect(session.score).toBe(0);
  });
});

describe("stepPlayGravity score", () => {
  it("does not change score when gravity moves without locking", () => {
    const before = createPlaySession();
    const result = stepPlayGravity(before);

    expect(result.linesCleared).toBe(0);
    expect(result.score).toBe(0);
  });

  it("adds single-line clear points when a lock clears one row", () => {
    const before = sessionWithLineClearSetup();
    const result = stepPlayGravity(before);

    expect(result.linesCleared).toBe(1);
    expect(result.score).toBe(100);
  });

  it("accumulates score across successive line clears", () => {
    const grid = createEmptyPlayfield();
    for (let x = 0; x < 10; x += 1) {
      if (x !== 4) {
        grid[18][x] = "locked";
        grid[19][x] = "locked";
      }
    }
    const onFloor = { ...spawnPiece("I"), x: 3, y: 19 };
    const first: PlaySession = {
      state: { grid, piece: onFloor, nextPiece: "T" },
      gameOver: false,
      score: 50,
    };

    const afterFirst = stepPlayGravity(first);
    expect(afterFirst.score).toBe(150);

    const gridAfterFirst = afterFirst.state.grid;
    for (let x = 0; x < 10; x += 1) {
      if (x !== 3) {
        gridAfterFirst[19][x] = "locked";
      }
    }
    const secondPiece = { ...spawnPiece("I"), x: 2, y: 19 };
    const second: PlaySession = {
      state: { ...afterFirst.state, grid: gridAfterFirst, piece: secondPiece },
      gameOver: false,
      score: afterFirst.score,
    };

    const afterSecond = stepPlayGravity(second);
    expect(afterSecond.linesCleared).toBe(1);
    expect(afterSecond.score).toBe(250);
  });
});

describe("handlePlayKey score", () => {
  it("leaves score unchanged for movement and rotation", () => {
    const before = createPlaySession();
    const afterLeft = handlePlayKey(before, "ArrowLeft");
    const afterRotate = handlePlayKey(before, "ArrowUp");

    expect(afterLeft.score).toBe(0);
    expect(afterRotate.score).toBe(0);
  });
});

describe("handlePlayAction score", () => {
  it("adds line-clear points on hard-drop when rows clear", () => {
    const before = sessionWithLineClearSetup();
    const after = handlePlayAction(before, "hard-drop");

    expect(after.linesCleared).toBe(1);
    expect(after.score).toBe(100);
  });

  it("does not change score on rotate-ccw", () => {
    const before = createPlaySession();
    const after = handlePlayAction(before, "rotate-ccw");

    expect(after.score).toBe(0);
  });
});

describe("score display wiring", () => {
  it("formats a human-readable score label for the HUD", () => {
    expect(formatScoreText(0)).toBe("Score: 0");
    expect(formatScoreText(1800)).toBe("Score: 1800");
  });

  it("exposes a score element in index.html", () => {
    const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
    expect(html).toMatch(/\bid=["']score["']/i);
  });

  it("updates the score element from session.score in main.ts", () => {
    const mainSource = readFileSync(new URL("../src/main.ts", import.meta.url), "utf8");
    expect(mainSource).toMatch(/getElementById\s*\(\s*["']score["']\s*\)/);
    expect(mainSource).toMatch(/formatScoreText/);
    expect(mainSource).toMatch(/session\.score/);
  });
});
