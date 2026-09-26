import type { PieceKind } from "./piece.js";

export const ALL_PIECE_KINDS: readonly PieceKind[] = [
  "I",
  "O",
  "T",
  "S",
  "Z",
  "J",
  "L",
];

export const DEFAULT_BAG_SEED = 53;

export type BagState = {
  seed: number;
  bagIndex: number;
  position: number;
};

function mulberry32(a: number): () => number {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function permutationFor(state: BagState): PieceKind[] {
  const rng = mulberry32(state.seed + state.bagIndex * 0x9e3779b9);
  const arr = [...ALL_PIECE_KINDS] as PieceKind[];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createBagState(seed: number): BagState {
  return { seed, bagIndex: 0, position: 0 };
}

export function takeFromBag(bag: BagState): { kind: PieceKind; bag: BagState } {
  const perm = permutationFor(bag);
  const kind = perm[bag.position];
  const nextPosition = bag.position + 1;
  if (nextPosition >= ALL_PIECE_KINDS.length) {
    return {
      kind,
      bag: { seed: bag.seed, bagIndex: bag.bagIndex + 1, position: 0 },
    };
  }
  return {
    kind,
    bag: { seed: bag.seed, bagIndex: bag.bagIndex, position: nextPosition },
  };
}
