import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createBagState, DEFAULT_BAG_SEED, takeFromBag } from "../src/bag.js";
import { createGameState, hardDrop } from "../src/game.js";
import { rotateActivePieceCounterClockwise, moveActivePiece } from "../src/input.js";
import { createPlaySession, handlePlayKey } from "../src/session.js";
import { nextPreviewCells } from "../src/render.js";

function queueAfterTwoDraws() {
  const first = takeFromBag(createBagState(DEFAULT_BAG_SEED));
  const second = takeFromBag(first.bag);
  const third = takeFromBag(second.bag);
  return { active: first.kind, next: second.kind, third: third.kind, bag: second.bag };
}

describe("input preserves seven-bag queue", () => {
  it("keeps bag and nextPiece after counter-clockwise rotation", () => {
    const session = createPlaySession();
    const before = session.state;
    const after = rotateActivePieceCounterClockwise(before);

    expect(after.nextPiece).toBe(before.nextPiece);
    expect(after.bag).toEqual(before.bag);
  });

  it("keeps bag and nextPiece after a lateral move", () => {
    const session = createPlaySession();
    const before = session.state;
    const after = moveActivePiece(before, -1, 0);

    expect(after.nextPiece).toBe(before.nextPiece);
    expect(after.bag).toEqual(before.bag);
  });

  it("does not change next preview cells when rotating", () => {
    const session = createPlaySession();
    const kind = session.state.nextPiece;
    const previewBefore = nextPreviewCells(kind);
    const after = rotateActivePieceCounterClockwise(session.state);
    expect(after.bag).toEqual(session.state.bag);
    expect(after.nextPiece).toBe(kind);
    expect(nextPreviewCells(after.nextPiece)).toEqual(previewBefore);
  });

  it("advances the queue from the bag after lock even if the player rotated first", () => {
    const q = queueAfterTwoDraws();
    let state = createGameState(q.active, q.next, q.bag);
    state = rotateActivePieceCounterClockwise(state);
    expect(state.bag).toEqual(q.bag);

    const locked = hardDrop(state);
    expect(locked.state.piece?.kind).toBe(q.next);
    expect(locked.state.nextPiece).toBe(q.third);
    expect(locked.state.bag).toBeDefined();
  });

  it("keeps bag through handlePlayKey ArrowUp", () => {
    const session = createPlaySession();
    const after = handlePlayKey(session, "ArrowUp");
    expect(after.state.bag).toEqual(session.state.bag);
    expect(after.state.nextPiece).toBe(session.state.nextPiece);
  });

  it("keeps bag through handlePlayKey ArrowLeft", () => {
    const session = createPlaySession();
    const after = handlePlayKey(session, "ArrowLeft");
    expect(after.state.bag).toEqual(session.state.bag);
    expect(after.state.nextPiece).toBe(session.state.nextPiece);
  });
});

describe("input seven-bag wiring", () => {
  it("carries optional bag through move and rotate helpers in input.ts", () => {
    const inputSource = readFileSync(new URL("../src/input.ts", import.meta.url), "utf8");
    expect(inputSource).toMatch(/state\.bag/);
    expect(inputSource).not.toMatch(
      /return\s*\{\s*grid:\s*state\.grid,\s*piece,\s*nextPiece:\s*state\.nextPiece,\s*\}/,
    );
  });
});
