import { describe, expect, it } from "vitest";
import { createEmptyPlayfield } from "../src/playfield.js";
import { spawnPiece } from "../src/piece.js";
import { levelFromTotalLines } from "../src/gravity-speed.js";
import {
  handlePlayAction,
  stepPlayGravity,
  type PlaySession,
} from "../src/session.js";

function sessionReadyToClearSingleLine(
  totalLinesCleared: number,
  score = 0,
): PlaySession {
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
    score,
    totalLinesCleared,
    paused: false,
  };
}

describe("line-clear score uses level before the clear", () => {
  it("still awards 100 on the first line at level 1", () => {
    const before = sessionReadyToClearSingleLine(0);
    const after = stepPlayGravity(before);

    expect(levelFromTotalLines(before.totalLinesCleared)).toBe(1);
    expect(after.linesCleared).toBe(1);
    expect(after.score).toBe(100);
  });

  it("awards double single-line points at level 2 (10 prior lines)", () => {
    const before = sessionReadyToClearSingleLine(10);
    const after = stepPlayGravity(before);

    expect(levelFromTotalLines(before.totalLinesCleared)).toBe(2);
    expect(after.linesCleared).toBe(1);
    expect(after.score).toBe(200);
  });

  it("scales hard-drop line clears with the same level rule", () => {
    const before = sessionReadyToClearSingleLine(10);
    const after = handlePlayAction(before, "hard-drop");

    expect(after.linesCleared).toBe(1);
    expect(after.score).toBe(200);
  });

  it("uses the pre-clear level when a clear crosses a level boundary", () => {
    const before = sessionReadyToClearSingleLine(9, 900);
    const after = stepPlayGravity(before);

    expect(levelFromTotalLines(before.totalLinesCleared)).toBe(1);
    expect(after.totalLinesCleared).toBe(10);
    expect(after.score).toBe(1000);
  });
});
