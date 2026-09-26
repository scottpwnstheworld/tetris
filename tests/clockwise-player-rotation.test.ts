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
import { rotateActivePieceClockwise } from "../src/input.js";
import { tryRotate } from "../src/rotation.js";
import { createPlaySession, handlePlayKey } from "../src/session.js";

function expectCells(piece: ActivePiece, expected: ReadonlyArray<readonly [number, number]>) {
  const cells = getPieceCells(piece);
  expect(cells).toHaveLength(expected.length);
  for (const [x, y] of expected) {
    expect(cells).toContainEqual({ x, y });
  }
}

describe("rotateActivePieceClockwise", () => {
  const grid = createEmptyPlayfield();

  it("advances the rotation index by one modulo four", () => {
    const before = createGameState("T", "O");
    const after = rotateActivePieceClockwise(before);

    expect(after.piece!.rotation).toBe(1);
  });

  it("matches a single tryRotate clockwise step, not counter-clockwise", () => {
    const before = createGameState("T", "O");
    const piece = before.piece!;

    const after = rotateActivePieceClockwise(before);
    const cw = tryRotate(piece, grid, "cw");
    const ccw = tryRotate(piece, grid, "ccw");

    expect(cw).not.toBeNull();
    expect(ccw).not.toBeNull();
    expect(after.piece).toEqual(cw);
    expect(after.piece!.rotation).not.toBe(ccw!.rotation);
  });

  it("returns to the spawn pose after four player rotation actions", () => {
    let state = createGameState("T", "O");
    for (let i = 0; i < 4; i += 1) {
      state = rotateActivePieceClockwise(state);
    }

    expect(state.piece).toEqual(spawnPiece("T"));
    expectCells(state.piece!, [
      [3, 0],
      [4, 0],
      [5, 0],
      [4, 1],
    ]);
  });

  it("performs one 90-degree clockwise step for every standard kind at spawn", () => {
    const kinds: PieceKind[] = ["I", "O", "T", "S", "Z", "J", "L"];
    for (const kind of kinds) {
      const before = createGameState(kind, "I");
      const after = rotateActivePieceClockwise(before);
      const expected = tryRotate(before.piece!, grid, "cw");

      expect(expected).not.toBeNull();
      expect(after.piece).toEqual(expected);
      expect((after.piece!.rotation ?? 0)).toBe(((before.piece!.rotation ?? 0) + 1) % 4);
    }
  });

  it("returns the same state when there is no active piece", () => {
    const before = createGameState("T", "O");
    const ended = { ...before, piece: null };
    const after = rotateActivePieceClockwise(ended);

    expect(after).toBe(ended);
  });
});

describe("play session clockwise rotation", () => {
  it("maps ArrowUp to one clockwise step with rotation index 1 for spawn T", () => {
    const before = createPlaySession();
    expect(before.state.piece!.rotation ?? 0).toBe(0);

    const after = handlePlayKey(before, "ArrowUp");

    expect(after.state.piece!.rotation).toBe(1);
    expectCells(after.state.piece!, [
      [4, 0],
      [3, 1],
      [4, 1],
      [5, 1],
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

describe("clockwise rotation wiring", () => {
  it("routes session ArrowUp through rotateActivePieceClockwise", () => {
    const sessionSource = readFileSync(new URL("../src/session.ts", import.meta.url), "utf8");
    expect(sessionSource).toMatch(/rotateActivePieceClockwise\s*\(/);
    expect(sessionSource).not.toMatch(/rotateActivePiece\s*\([^)]*,\s*["']cw["']\s*\)/);
  });

  it("documents clockwise rotation in the dev preview status copy", () => {
    const mainSource = readFileSync(new URL("../src/main.ts", import.meta.url), "utf8");
    expect(mainSource.toLowerCase()).toMatch(/clockwise/);
  });
});
