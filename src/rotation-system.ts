import { isInsidePlayfield, type Playfield } from "./playfield.js";
import type { PieceKind } from "./piece.js";

export type PiecePose = {
  kind: PieceKind;
  x: number;
  y: number;
  rotation: number;
};

export type RotateDirection = "cw" | "ccw";

type Offset = readonly [number, number];

/** Guideline spawn (rotation 0) cell offsets — sole stored shape data per kind. */
export const ROTATION_ZERO_OFFSETS: Record<PieceKind, readonly Offset[]> = {
  I: [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ],
  O: [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ],
  T: [
    [0, 0],
    [1, 0],
    [2, 0],
    [1, 1],
  ],
  S: [
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
  ],
  Z: [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
  ],
  J: [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 2],
  ],
  L: [
    [2, 0],
    [2, 1],
    [2, 2],
    [1, 2],
  ],
};

const I_CLOCKWISE_STEPS: readonly Offset[] = [[-1, 0], [0, -1], [-1, 0]];

const JLSTZ_CLOCKWISE_LOCAL: Record<
  Exclude<PieceKind, "I" | "O">,
  readonly (readonly Offset[])[]
> = {
  T: [
    [
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [2, 1],
      [1, 2],
    ],
    [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
  ],
  S: [
    [
      [1, 0],
      [1, 1],
      [2, 1],
      [2, 2],
    ],
    [
      [2, 0],
      [2, 1],
      [1, 1],
      [1, 2],
    ],
    [
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
  ],
  Z: [
    [
      [1, 0],
      [0, 1],
      [1, 1],
      [0, 2],
    ],
    [
      [2, 0],
      [2, 1],
      [1, 1],
      [1, 2],
    ],
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
  ],
  J: [
    [
      [1, 0],
      [2, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 2],
      [0, 2],
    ],
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [0, 2],
    ],
  ],
  L: [
    [
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 2],
    ],
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [1, 0],
      [0, 1],
      [0, 2],
      [1, 2],
    ],
  ],
};

const JLSTZ_KICKS: readonly Offset[][] = [
  [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
];

const I_KICKS: readonly Offset[][] = [
  [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
];

function rotateMatrix4(cells: readonly Offset[]): Offset[] {
  const size = 4;
  const grid = Array.from({ length: size }, () => Array<number>(size).fill(0));
  for (const [x, y] of cells) {
    if (x >= 0 && y >= 0 && x < size && y < size) {
      grid[y][x] = 1;
    }
  }
  const rotated = Array.from({ length: size }, () => Array<number>(size).fill(0));
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      rotated[x][size - 1 - y] = grid[y][x];
    }
  }
  const out: Offset[] = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (rotated[y][x]) {
        out.push([x, y]);
      }
    }
  }
  return out;
}

function clockwiseLocalFromCurrent(
  kind: PieceKind,
  fromRotation: number,
  current: readonly Offset[],
): readonly Offset[] {
  if (kind === "O") {
    return current;
  }
  if (kind === "I") {
    const step = I_CLOCKWISE_STEPS[fromRotation];
    const rotated = rotateMatrix4(current);
    return rotated.map(([x, y]) => [x + step[0], y + step[1]] as const);
  }
  return JLSTZ_CLOCKWISE_LOCAL[kind][fromRotation];
}

export function advanceRotationIndex(rotation: number, direction: RotateDirection): number {
  const delta = direction === "cw" ? 1 : 3;
  return (rotation + delta) % 4;
}

export function getLocalOffsets(kind: PieceKind, rotation: number): readonly Offset[] {
  const steps = ((rotation % 4) + 4) % 4;
  let offsets: readonly Offset[] = ROTATION_ZERO_OFFSETS[kind];
  for (let i = 0; i < steps; i += 1) {
    offsets = clockwiseLocalFromCurrent(kind, i, offsets);
  }
  return offsets;
}

export function getWorldCells(pose: PiecePose): ReadonlyArray<{ x: number; y: number }> {
  const local = getLocalOffsets(pose.kind, pose.rotation);
  return local.map(([dx, dy]) => ({ x: pose.x + dx, y: pose.y + dy }));
}

function kickIndex(from: number, to: number): number {
  const cw = (to - from + 4) % 4 === 1;
  if (from === 0 && to === 1) {
    return cw ? 0 : 7;
  }
  if (from === 1 && to === 0) {
    return cw ? 1 : 6;
  }
  if (from === 1 && to === 2) {
    return cw ? 2 : 5;
  }
  if (from === 2 && to === 1) {
    return cw ? 3 : 4;
  }
  if (from === 2 && to === 3) {
    return cw ? 4 : 5;
  }
  if (from === 3 && to === 2) {
    return cw ? 5 : 4;
  }
  if (from === 3 && to === 0) {
    return cw ? 6 : 7;
  }
  if (from === 0 && to === 3) {
    return cw ? 7 : 6;
  }
  return 0;
}

export function getWallKickOffsets(
  kind: PieceKind,
  fromRotation: number,
  toRotation: number,
): readonly Offset[] {
  if (kind === "O") {
    return [[0, 0]];
  }
  const index = kickIndex(fromRotation, toRotation);
  return kind === "I" ? I_KICKS[index] : JLSTZ_KICKS[index];
}

type PlacementFailure = "ok" | "locked" | "bounds";

function placementFailure(pose: PiecePose, grid: Playfield): PlacementFailure {
  let outOfBounds = false;
  for (const { x, y } of getWorldCells(pose)) {
    if (!isInsidePlayfield(x, y)) {
      outOfBounds = true;
      continue;
    }
    if (grid[y][x] === "locked") {
      return "locked";
    }
  }
  if (outOfBounds) {
    return "bounds";
  }
  return "ok";
}

export function attemptRotate(
  pose: PiecePose,
  grid: Playfield,
  direction: RotateDirection,
): PiecePose | null {
  const fromRotation = pose.rotation;
  const toRotation = advanceRotationIndex(fromRotation, direction);
  const kicks = getWallKickOffsets(pose.kind, fromRotation, toRotation);

  const nominal: PiecePose = {
    kind: pose.kind,
    x: pose.x + kicks[0][0],
    y: pose.y + kicks[0][1],
    rotation: toRotation,
  };
  const nominalResult = placementFailure(nominal, grid);
  if (nominalResult === "ok") {
    return nominal;
  }
  if (nominalResult === "locked") {
    return null;
  }

  for (let i = 1; i < kicks.length; i += 1) {
    const [dx, dy] = kicks[i];
    const candidate: PiecePose = {
      kind: pose.kind,
      x: pose.x + dx,
      y: pose.y + dy,
      rotation: toRotation,
    };
    if (placementFailure(candidate, grid) === "ok") {
      return candidate;
    }
  }

  return null;
}
