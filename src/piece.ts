import { getLocalOffsets } from "./rotation-system.js";

export type PieceKind = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export type ActivePiece = {
  kind: PieceKind;
  x: number;
  y: number;
  rotation?: number;
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
  const offsets = getLocalOffsets(piece.kind, rotation);
  return offsets.map(([dx, dy]) => ({
    x: piece.x + dx,
    y: piece.y + dy,
  }));
}
