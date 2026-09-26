import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createBagState, DEFAULT_BAG_SEED, takeFromBag } from "../src/bag.js";
import { createPlaySession } from "../src/session.js";

describe("createPlaySession seven-bag queue", () => {
  it("starts with the first two kinds from the default seeded bag", () => {
    const first = takeFromBag(createBagState(DEFAULT_BAG_SEED));
    const second = takeFromBag(first.bag);

    const session = createPlaySession();

    expect(session.state.piece!.kind).toBe(first.kind);
    expect(session.state.nextPiece).toBe(second.kind);
    expect(session.state.bag).toEqual(second.bag);
  });
});

describe("seven-bag wiring", () => {
  it("advances the queue inside game lock/respawn using takeFromBag", () => {
    const gameSource = readFileSync(new URL("../src/game.ts", import.meta.url), "utf8");
    expect(gameSource).toMatch(/from\s+["']\.\/bag\.js["']/);
    expect(gameSource).toMatch(/takeFromBag\s*\(/);
    expect(gameSource).toMatch(/bag\s*:/);
  });

  it("creates play sessions from the shared default bag seed", () => {
    const sessionSource = readFileSync(new URL("../src/session.ts", import.meta.url), "utf8");
    expect(sessionSource).toMatch(/from\s+["']\.\/bag\.js["']/);
    expect(sessionSource).toMatch(/createBagState\s*\(/);
    expect(sessionSource).toMatch(/DEFAULT_BAG_SEED/);
    expect(sessionSource).not.toMatch(/createGameState\s*\(\s*["']T["']\s*,\s*["']O["']\s*\)/);
  });
});
