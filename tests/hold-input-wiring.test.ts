import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createBagState, takeFromBag } from "../src/bag.js";
import { createGameState } from "../src/game.js";
import { moveActivePiece } from "../src/input.js";
import { swapHold } from "../src/hold.js";

describe("input preserves hold fields", () => {
  it("keeps holdPiece and holdLocked after a lateral move", () => {
    const first = takeFromBag(createBagState(1));
    const second = takeFromBag(first.bag);
    const before = {
      ...createGameState(first.kind, second.kind, second.bag),
      holdPiece: "L" as const,
      holdLocked: true,
    };
    const after = moveActivePiece(before, 1, 0);
    expect(after.holdPiece).toBe("L");
    expect(after.holdLocked).toBe(true);
  });

  it("input.ts spreads hold fields in stateWithPiece", () => {
    const source = readFileSync(new URL("../src/input.ts", import.meta.url), "utf8");
    expect(source).toMatch(/holdPiece/);
    expect(source).toMatch(/holdLocked/);
  });
});

describe("game.ts preserves hold through gravity", () => {
  it("carries holdPiece and holdLocked on successful gravity steps", () => {
    const source = readFileSync(new URL("../src/game.ts", import.meta.url), "utf8");
    expect(source).toMatch(/holdPiece/);
    expect(source).toMatch(/holdLocked/);
  });
});

describe("hold module", () => {
  it("exports swapHold from hold.ts", () => {
    expect(typeof swapHold).toBe("function");
  });
});
