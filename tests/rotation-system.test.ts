import { describe, expect, it } from "vitest";
import { createEmptyPlayfield } from "../src/playfield.js";
import type { PieceKind } from "../src/piece.js";
import {
  ROTATION_ZERO_OFFSETS,
  advanceRotationIndex,
  getLocalOffsets,
  getWallKickOffsets,
  getWorldCells,
  attemptRotate,
  type PiecePose,
} from "../src/rotation-system.js";

const ALL_KINDS: PieceKind[] = ["I", "O", "T", "S", "Z", "J", "L"];

function cellsKey(cells: ReadonlyArray<{ x: number; y: number }>): string {
  return cells
    .map(({ x, y }) => `${x},${y}`)
    .sort()
    .join("|");
}

/** Guideline world cells at anchor (0, 0) — derived from correct SRS-style footprints. */
const GUIDELINE_AT_ORIGIN: Record<PieceKind, ReadonlyArray<ReadonlyArray<readonly [number, number]>>> = {
  I: [
    [[0, 0], [1, 0], [2, 0], [3, 0]],
    [[2, 0], [2, 1], [2, 2], [2, 3]],
    [[0, 1], [1, 1], [2, 1], [3, 1]],
    [[1, 0], [1, 1], [1, 2], [1, 3]],
  ],
  O: [
    [[0, 0], [1, 0], [0, 1], [1, 1]],
    [[0, 0], [1, 0], [0, 1], [1, 1]],
    [[0, 0], [1, 0], [0, 1], [1, 1]],
    [[0, 0], [1, 0], [0, 1], [1, 1]],
  ],
  T: [
    [[0, 0], [1, 0], [2, 0], [1, 1]],
    [[1, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [2, 1], [1, 2]],
    [[1, 0], [0, 1], [1, 1], [1, 2]],
  ],
  S: [
    [[1, 0], [2, 0], [0, 1], [1, 1]],
    [[1, 0], [1, 1], [2, 1], [2, 2]],
    [[2, 0], [2, 1], [1, 1], [1, 2]],
    [[0, 0], [0, 1], [1, 1], [2, 1]],
  ],
  Z: [
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[1, 0], [0, 1], [1, 1], [0, 2]],
    [[2, 0], [2, 1], [1, 1], [1, 2]],
    [[0, 0], [1, 0], [0, 1], [1, 1]],
  ],
  J: [
    [[0, 0], [0, 1], [0, 2], [1, 2]],
    [[1, 0], [2, 0], [1, 1], [1, 2]],
    [[1, 0], [1, 1], [1, 2], [0, 2]],
    [[0, 0], [1, 0], [0, 1], [0, 2]],
  ],
  L: [
    [[2, 0], [2, 1], [2, 2], [1, 2]],
    [[1, 0], [1, 1], [1, 2], [2, 2]],
    [[0, 0], [1, 0], [1, 1], [1, 2]],
    [[1, 0], [0, 1], [0, 2], [1, 2]],
  ],
};

function pose(kind: PieceKind, x: number, y: number, rotation: number): PiecePose {
  return { kind, x, y, rotation };
}

describe("rotation-system data model", () => {
  it("stores only rotation-zero offset definitions for all seven kinds", () => {
    expect(Object.keys(ROTATION_ZERO_OFFSETS).sort()).toEqual([...ALL_KINDS].sort());
    for (const kind of ALL_KINDS) {
      expect(ROTATION_ZERO_OFFSETS[kind]).toHaveLength(4);
    }
  });

  it("derives every rotation index from rotation-zero data (no hand-maintained shape tables)", () => {
    for (const kind of ALL_KINDS) {
      for (let rotation = 0; rotation < 4; rotation += 1) {
        const derived = getLocalOffsets(kind, rotation);
        const expected = GUIDELINE_AT_ORIGIN[kind][rotation];
        expect(derived).toHaveLength(4);
        expect(cellsKey(derived.map(([dx, dy]) => ({ x: dx, y: dy })))).toBe(
          cellsKey(expected.map(([x, y]) => ({ x, y }))),
        );
      }
    }
  });

  it("maps local offsets to world cells at the piece anchor", () => {
    const world = getWorldCells(pose("T", 3, 0, 3));
    expect(cellsKey(world)).toBe(
      cellsKey(GUIDELINE_AT_ORIGIN.T[3].map(([x, y]) => ({ x: x + 3, y: y + 0 }))),
    );
  });
});

describe("rotation-system index math", () => {
  it("advances clockwise and counter-clockwise modulo four", () => {
    expect(advanceRotationIndex(0, "cw")).toBe(1);
    expect(advanceRotationIndex(0, "ccw")).toBe(3);
    expect(advanceRotationIndex(3, "cw")).toBe(0);
  });

  it("returns to rotation zero after four clockwise index steps", () => {
    let rotation = 0;
    for (let i = 0; i < 4; i += 1) {
      rotation = advanceRotationIndex(rotation, "cw");
    }
    expect(rotation).toBe(0);
  });
});

describe("SRS wall kick tables", () => {
  it("uses the guideline JLSTZ kick set for T rotation 0 to 1", () => {
    expect(getWallKickOffsets("T", 0, 1)).toEqual([
      [0, 0],
      [-1, 0],
      [-1, 1],
      [0, -2],
      [-1, -2],
    ]);
  });

  it("uses the guideline I kick set for rotation 0 to 1", () => {
    expect(getWallKickOffsets("I", 0, 1)).toEqual([
      [0, 0],
      [-2, 0],
      [1, 0],
      [-2, -1],
      [1, 2],
    ]);
  });

  it("uses a single no-op kick for O piece transitions", () => {
    expect(getWallKickOffsets("O", 0, 1)).toEqual([[0, 0]]);
    expect(getWallKickOffsets("O", 2, 3)).toEqual([[0, 0]]);
  });
});

describe("attemptRotate", () => {
  const grid = createEmptyPlayfield();

  it("matches spawn T counter-clockwise geometry via the new rotation pipeline", () => {
    const piece = pose("T", 3, 0, 0);
    const rotated = attemptRotate(piece, grid, "ccw");

    expect(rotated).not.toBeNull();
    expect(rotated!.rotation).toBe(3);
    expect(cellsKey(getWorldCells(rotated!))).toBe(
      cellsKey(GUIDELINE_AT_ORIGIN.T[3].map(([x, y]) => ({ x: x + 3, y }))),
    );
  });

  it("applies an SRS I wall kick when rotating clockwise against the right wall", () => {
    const piece = pose("I", 5, 0, 0);
    const rotated = attemptRotate(piece, grid, "cw");

    expect(rotated).not.toBeNull();
    expect(cellsKey(getWorldCells(rotated!))).toBe("7,0|7,1|7,2|7,3");
  });

  it("rejects rotation when every kick collides with locked cells", () => {
    const blocked = createEmptyPlayfield();
    blocked[1][4] = "locked";
    const piece = pose("T", 3, 0, 0);

    expect(attemptRotate(piece, blocked, "ccw")).toBeNull();
  });
});
