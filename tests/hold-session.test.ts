import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { spawnPiece } from "../src/piece.js";
import {
  createPlaySession,
  handlePlayAction,
  handlePlayKey,
  restartPlaySession,
} from "../src/session.js";

describe("createPlaySession hold defaults", () => {
  it("starts with an empty hold slot and hold unlocked", () => {
    const session = createPlaySession();
    expect(session.state.holdPiece ?? null).toBe(null);
    expect(session.state.holdLocked ?? false).toBe(false);
  });
});

describe("handlePlayKey hold", () => {
  it("maps KeyC to swapHold while play is active", () => {
    const session = createPlaySession();
    const kind = session.state.piece!.kind;
    const nextBefore = session.state.nextPiece;
    const after = handlePlayKey(session, "KeyC");

    expect(after.state.holdPiece).toBe(kind);
    expect(after.state.piece).toEqual(spawnPiece(nextBefore));
    expect(after.state.holdLocked).toBe(true);
  });

  it("ignores KeyC after game over", () => {
    const session = {
      ...createPlaySession(),
      gameOver: true,
      state: { ...createPlaySession().state, piece: null },
    };
    const after = handlePlayKey(session, "KeyC");
    expect(after).toBe(session);
  });
});

describe("handlePlayAction hold", () => {
  it("performs hold through the touch action without reporting line clears", () => {
    const session = createPlaySession();
    const kind = session.state.piece!.kind;
    const result = handlePlayAction(session, "hold");

    expect(result).toMatchObject({
      linesCleared: 0,
      gameOver: false,
    });
    expect(result.state.holdPiece).toBe(kind);
    expect(result.state.holdLocked).toBe(true);
  });

  it("no-ops hold while play is active only once per lock cycle", () => {
    const session = createPlaySession();
    const once = handlePlayKey(session, "KeyC");
    const twice = handlePlayKey(once, "KeyC");
    expect(twice.state.piece).toEqual(once.state.piece);
    expect(twice.state.holdPiece).toBe(once.state.holdPiece);
  });
});

describe("restart resets hold", () => {
  it("clears hold after restartPlaySession", () => {
    const session = createPlaySession();
    const kind = session.state.piece!.kind;
    const held = handlePlayKey(session, "KeyC");
    expect(held.state.holdPiece).toBe(kind);

    const restarted = restartPlaySession({ ...held, gameOver: true });
    expect(restarted.state.holdPiece ?? null).toBe(null);
    expect(restarted.state.holdLocked ?? false).toBe(false);
  });
});

describe("hold session wiring", () => {
  it("session.ts imports swapHold and handles KeyC and hold action", () => {
    const source = readFileSync(new URL("../src/session.ts", import.meta.url), "utf8");
    expect(source).toMatch(/from\s+["']\.\/hold\.js["']/);
    expect(source).toMatch(/swapHold\s*\(/);
    expect(source).toMatch(/KeyC/);
    expect(source).toMatch(/case\s+["']hold["']/);
  });
});
