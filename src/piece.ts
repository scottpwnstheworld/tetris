export type PieceKind = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export type ActivePiece = {
  kind: PieceKind;
  x: number;
  y: number;
  rotation?: number;
};

type Offset = readonly [number, number];

const SHAPES: Record<PieceKind, readonly (readonly Offset[])[]> = {
  I: [
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ],
    [
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
    ],
    [
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
    ],
  ],
  O: [
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
  ],
  T: [
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [1, 1],
    ],
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
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
  ],
  S: [
    [
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
    ],
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
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
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
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
    ],
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
      [2, 0],
      [2, 1],
      [2, 2],
      [1, 2],
    ],
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

const SPAWN: Record<PieceKind, readonly [number, number]> = {
  I: [3, 0],
  O: [4, 0],
  T: [3, 0],
  S: [3, 0],
  Z: [3, 0],
  J: [3, 0],
  L: [3, 0],
};

export function spawnPiece(kind: PieceKind): ActivePiece {
  const [x, y] = SPAWN[kind];
  return { kind, x, y, rotation: 0 };
}

export function getPieceCells(piece: ActivePiece): ReadonlyArray<{ x: number; y: number }> {
  const rotation = piece.rotation ?? 0;
  const offsets = SHAPES[piece.kind][rotation];
  return offsets.map(([dx, dy]) => ({
    x: piece.x + dx,
    y: piece.y + dy,
  }));
}
