import { describe, expect, it } from "vitest";
import type { PieceKind } from "../src/piece.js";
import {
  ALL_PIECE_KINDS,
  createBagState,
  takeFromBag,
  type BagState,
} from "../src/bag.js";

const STANDARD_KINDS: PieceKind[] = ["I", "O", "T", "S", "Z", "J", "L"];

function drainBag(bag: BagState, count: number): { kinds: PieceKind[]; bag: BagState } {
  const kinds: PieceKind[] = [];
  let current = bag;
  for (let i = 0; i < count; i += 1) {
    const next = takeFromBag(current);
    kinds.push(next.kind);
    current = next.bag;
  }
  return { kinds, bag: current };
}

describe("ALL_PIECE_KINDS", () => {
  it("lists each standard tetromino exactly once", () => {
    expect([...ALL_PIECE_KINDS].sort()).toEqual([...STANDARD_KINDS].sort());
    expect(ALL_PIECE_KINDS.length).toBe(7);
  });
});

describe("createBagState", () => {
  it("is deterministic for a fixed seed", () => {
    const first = drainBag(createBagState(42), 7).kinds;
    const second = drainBag(createBagState(42), 7).kinds;
    expect(first).toEqual(second);
    expect(first).not.toEqual(drainBag(createBagState(43), 7).kinds);
  });
});

describe("takeFromBag", () => {
  it("does not mutate the input bag state", () => {
    const bag = createBagState(1);
    const snapshot = JSON.stringify(bag);
    takeFromBag(bag);
    expect(JSON.stringify(bag)).toBe(snapshot);
  });

  it("returns each kind exactly once before the bag refills", () => {
    const { kinds } = drainBag(createBagState(7), 7);
    expect(kinds.sort()).toEqual([...STANDARD_KINDS].sort());
  });

  it("refills with a fresh permutation after seven draws", () => {
    const firstBag = createBagState(11);
    const afterSeven = drainBag(firstBag, 7);
    const eighth = takeFromBag(afterSeven.bag);

    expect(afterSeven.kinds.sort()).toEqual([...STANDARD_KINDS].sort());
    expect(STANDARD_KINDS).toContain(eighth.kind);

    const nextSeven = drainBag(eighth.bag, 6).kinds;
    expect([eighth.kind, ...nextSeven].sort()).toEqual([...STANDARD_KINDS].sort());
  });

  it("never emits a kind outside the seven-bag set", () => {
    let bag = createBagState(3);
    for (let i = 0; i < 21; i += 1) {
      const next = takeFromBag(bag);
      expect(STANDARD_KINDS).toContain(next.kind);
      bag = next.bag;
    }
  });
});
