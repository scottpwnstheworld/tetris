import { describe, expect, it } from "vitest";
import {
  createPlaySession,
  handlePlayAction,
  handlePlayKey,
  type PlaySession,
} from "../src/session.js";

function pausedSession(): PlaySession {
  return { ...createPlaySession(), paused: true };
}

describe("handlePlayKey while paused", () => {
  it("ignores KeyC without swapping hold", () => {
    const paused = pausedSession();
    const kind = paused.state.piece!.kind;

    const after = handlePlayKey(paused, "KeyC");

    expect(after).toBe(paused);
    expect(after.state.holdPiece ?? null).toBe(null);
    expect(after.state.piece!.kind).toBe(kind);
    expect(after.state.holdLocked ?? false).toBe(false);
  });

  it("ignores ArrowUp without rotating", () => {
    const paused = pausedSession();
    const rotationBefore = paused.state.piece!.rotation;

    const after = handlePlayKey(paused, "ArrowUp");

    expect(after).toBe(paused);
    expect(after.state.piece!.rotation).toBe(rotationBefore);
  });

  it("ignores KeyX without rotating clockwise", () => {
    const paused = pausedSession();
    const rotationBefore = paused.state.piece!.rotation;

    const after = handlePlayKey(paused, "KeyX");

    expect(after).toBe(paused);
    expect(after.state.piece!.rotation).toBe(rotationBefore);
  });
});

describe("handlePlayAction gameplay while paused", () => {
  it("does not hold through the touch action", () => {
    const paused = pausedSession();
    const kind = paused.state.piece!.kind;

    const after = handlePlayAction(paused, "hold");

    expect(after).toBe(paused);
    expect(after.state.holdPiece ?? null).toBe(null);
    expect(after.state.piece!.kind).toBe(kind);
  });

  it("does not rotate counter-clockwise through rotate-ccw", () => {
    const paused = pausedSession();
    const rotationBefore = paused.state.piece!.rotation;

    const after = handlePlayAction(paused, "rotate-ccw");

    expect(after).toBe(paused);
    expect(after.state.piece!.rotation).toBe(rotationBefore);
  });

  it("does not rotate clockwise through rotate-cw", () => {
    const paused = pausedSession();
    const rotationBefore = paused.state.piece!.rotation;

    const after = handlePlayAction(paused, "rotate-cw");

    expect(after).toBe(paused);
    expect(after.state.piece!.rotation).toBe(rotationBefore);
  });

  it("returns the same session reference for every blocked gameplay action", () => {
    const paused = pausedSession();
    const blocked = [
      "move-left",
      "move-right",
      "move-down",
      "rotate-ccw",
      "rotate-cw",
      "hard-drop",
      "hold",
    ] as const;

    for (const action of blocked) {
      expect(handlePlayAction(paused, action)).toBe(paused);
    }
  });
});
