import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createEmptyPlayfield } from "../src/playfield.js";
import {
  getPieceCells,
  spawnPiece,
  type ActivePiece,
  type PieceKind,
} from "../src/piece.js";
import { createGameState } from "../src/game.js";
import { rotateActivePieceCounterClockwise } from "../src/input.js";
import { tryRotate } from "../src/rotation.js";
import { createPlaySession, handlePlayKey } from "../src/session.js";

function expectCells(piece: ActivePiece, expected: ReadonlyArray<readonly [number, number]>) {
  const cells = getPieceCells(piece);
  expect(cells).toHaveLength(expected.length);
  for (const [x, y] of expected) {
    expect(cells).toContainEqual({ x, y });
  }
}

describe("rotateActivePieceCounterClockwise", () => {
  const grid = createEmptyPlayfield();

  it("retreats the rotation index by one modulo four", () => {
    const before = createGameState("T", "O");
    const after = rotateActivePieceCounterClockwise(before);

    expect(after.piece!.rotation).toBe(3);
  });

  it("matches a single tryRotate counter-clockwise step, not clockwise", () => {
    const before = createGameState("T", "O");
    const piece = before.piece!;

    const after = rotateActivePieceCounterClockwise(before);
    const ccw = tryRotate(piece, grid, "ccw");
    const cw = tryRotate(piece, grid, "cw");

    expect(ccw).not.toBeNull();
    expect(cw).not.toBeNull();
    expect(after.piece).toEqual(ccw);
    expect(after.piece!.rotation).not.toBe(cw!.rotation);
  });

  it("returns to the spawn pose after four player rotation actions", () => {
    let state = createGameState("T", "O");
    for (let i = 0; i < 4; i += 1) {
      state = rotateActivePieceCounterClockwise(state);
    }

    expect(state.piece).toEqual(spawnPiece("T"));
    expectCells(state.piece!, [
      [3, 0],
      [4, 0],
      [5, 0],
      [4, 1],
    ]);
  });

  it("performs one 90-degree counter-clockwise step for every standard kind at spawn", () => {
    const kinds: PieceKind[] = ["I", "O", "T", "S", "Z", "J", "L"];
    for (const kind of kinds) {
      const before = createGameState(kind, "I");
      const after = rotateActivePieceCounterClockwise(before);
      const expected = tryRotate(before.piece!, grid, "ccw");

      expect(expected).not.toBeNull();
      expect(after.piece).toEqual(expected);
      expect((after.piece!.rotation ?? 0)).toBe(((before.piece!.rotation ?? 0) + 3) % 4);
    }
  });

  it("returns the same state when there is no active piece", () => {
    const before = createGameState("T", "O");
    const ended = { ...before, piece: null };
    const after = rotateActivePieceCounterClockwise(ended);

    expect(after).toBe(ended);
  });
});

describe("play session counter-clockwise rotation", () => {
  it("maps ArrowUp to one counter-clockwise step with rotation index 3 for spawn T", () => {
    const before = createPlaySession();
    expect(before.state.piece!.rotation ?? 0).toBe(0);

    const after = handlePlayKey(before, "ArrowUp");

    expect(after.state.piece!.rotation).toBe(3);
    expectCells(after.state.piece!, [
      [4, 0],
      [3, 1],
      [4, 1],
      [4, 2],
    ]);
  });

  it("returns to spawn T after four ArrowUp presses", () => {
    let session = createPlaySession();
    for (let i = 0; i < 4; i += 1) {
      session = handlePlayKey(session, "ArrowUp");
    }

    expect(session.state.piece).toEqual(spawnPiece("T"));
  });
});

describe("counter-clockwise rotation wiring", () => {
  it("routes session ArrowUp through rotateActivePieceCounterClockwise", () => {
    const sessionSource = readFileSync(new URL("../src/session.ts", import.meta.url), "utf8");
    expect(sessionSource).toMatch(/rotateActivePieceCounterClockwise\s*\(/);
    expect(sessionSource).not.toMatch(/rotateActivePieceClockwise\s*\(/);
    expect(sessionSource).not.toMatch(/rotateActivePiece\s*\([^)]*,\s*["']ccw["']\s*\)/);
  });

  it("documents counter-clockwise rotation in the dev preview status copy", () => {
    const hintsSource = readFileSync(
      new URL("../src/play-hints.ts", import.meta.url),
      "utf8",
    );
    expect(hintsSource.toLowerCase()).toMatch(/counter[- ]?clockwise/);
  });
});
