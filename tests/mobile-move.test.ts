import { describe, expect, it } from "vitest";
import { createEmptyPlayfield } from "../src/playfield.js";
import {
  createPlaySession,
  handlePlayAction,
  handlePlayKey,
  type PlaySession,
} from "../src/session.js";

describe("handlePlayAction touch movement", () => {
  it("moves left like ArrowLeft", () => {
    const before = createPlaySession();
    const fromKey = handlePlayKey(before, "ArrowLeft");
    const fromTouch = handlePlayAction(before, "move-left");

    expect(fromTouch).toEqual({ ...fromKey, linesCleared: 0 });
    expect(fromTouch.state.piece!.x).toBe(before.state.piece!.x - 1);
  });

  it("moves right like ArrowRight", () => {
    const before = createPlaySession();
    const fromKey = handlePlayKey(before, "ArrowRight");
    const fromTouch = handlePlayAction(before, "move-right");

    expect(fromTouch).toEqual({ ...fromKey, linesCleared: 0 });
    expect(fromTouch.state.piece!.x).toBe(before.state.piece!.x + 1);
  });

  it("soft-drops one row like ArrowDown", () => {
    const before = createPlaySession();
    const fromKey = handlePlayKey(before, "ArrowDown");
    const fromTouch = handlePlayAction(before, "move-down");

    expect(fromTouch).toEqual({ ...fromKey, linesCleared: 0 });
    expect(fromTouch.state.piece!.y).toBe(before.state.piece!.y + 1);
  });

  it("preserves score and total line count on movement", () => {
    const before: PlaySession = {
      ...createPlaySession(),
      score: 300,
      totalLinesCleared: 7,
    };

    const after = handlePlayAction(before, "move-left");

    expect(after.score).toBe(300);
    expect(after.totalLinesCleared).toBe(7);
    expect(after.paused).toBe(false);
  });

  it("does not move while paused", () => {
    const paused: PlaySession = { ...createPlaySession(), paused: true };

    for (const action of ["move-left", "move-right", "move-down"] as const) {
      const after = handlePlayAction(paused, action);
      expect(after).toBe(paused);
    }
  });

  it("ignores movement actions after game over", () => {
    const ended: PlaySession = {
      state: {
        grid: createEmptyPlayfield(),
        piece: null,
        nextPiece: "T",
      },
      gameOver: true,
      score: 0,
      totalLinesCleared: 0,
      paused: false,
    };

    for (const action of ["move-left", "move-right", "move-down"] as const) {
      expect(handlePlayAction(ended, action)).toEqual(ended);
    }
  });
});
