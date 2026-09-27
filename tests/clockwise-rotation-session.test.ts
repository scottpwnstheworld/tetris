import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createBagState, DEFAULT_BAG_SEED, takeFromBag } from "../src/bag.js";
import { createGameState } from "../src/game.js";
import { rotateActivePieceClockwise } from "../src/input.js";
import {
  createPlaySession,
  handlePlayAction,
  handlePlayKey,
  type PlaySession,
} from "../src/session.js";

describe("clockwise rotation preserves bag queue", () => {
  it("keeps bag and nextPiece after clockwise rotation", () => {
    const first = takeFromBag(createBagState(DEFAULT_BAG_SEED));
    const second = takeFromBag(first.bag);
    const before = createGameState(first.kind, second.kind, second.bag);

    const after = rotateActivePieceClockwise(before);

    expect(after.bag).toEqual(before.bag);
    expect(after.nextPiece).toBe(before.nextPiece);
  });

  it("keeps bag and nextPiece after KeyX in a play session", () => {
    const before = createPlaySession();
    const after = handlePlayKey(before, "KeyX");

    expect(after.state.bag).toEqual(before.state.bag);
    expect(after.state.nextPiece).toBe(before.state.nextPiece);
  });
});

describe("handlePlayAction rotate-cw", () => {
  it("rotates clockwise on rotate-cw like KeyX", () => {
    const before = createPlaySession();
    const fromKey = handlePlayKey(before, "KeyX");
    const fromMobile = handlePlayAction(before, "rotate-cw");

    expect(fromMobile).toEqual({ ...fromKey, linesCleared: 0 });
  });

  it("does not accept rotate-cw after game over", () => {
    const ended: PlaySession = {
      state: {
        grid: createGameState("T", "O").grid,
        piece: null,
        nextPiece: "T",
      },
      gameOver: true,
      score: 0,
      totalLinesCleared: 0,
      paused: false,
    };
    const after = handlePlayAction(ended, "rotate-cw");

    expect(after).toEqual(ended);
  });
});

describe("rotate-cw session wiring", () => {
  it("implements rotate-cw in handlePlayAction", () => {
    const sessionSource = readFileSync(new URL("../src/session.ts", import.meta.url), "utf8");
    expect(sessionSource).toMatch(/["']rotate-cw["']/);
    expect(sessionSource).toMatch(/rotateActivePieceClockwise/);
  });
});
