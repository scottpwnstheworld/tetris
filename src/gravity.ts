import type { Playfield } from "./playfield.js";
import { getPieceCells, type ActivePiece } from "./piece.js";
import { tryMove } from "./movement.js";

export function lockPiece(piece: ActivePiece, grid: Playfield): Playfield {
  const locked = grid.map((row) => row.slice());
  for (const { x, y } of getPieceCells(piece)) {
    locked[y][x] = "locked";
  }
  return locked;
}

export type StepDownResult = {
  piece: ActivePiece | null;
  grid: Playfield;
};

export function stepDown(piece: ActivePiece, grid: Playfield): StepDownResult {
  const moved = tryMove(piece, grid, 0, 1);
  if (moved !== null) {
    return { piece: moved, grid };
  }
  return { piece: null, grid: lockPiece(piece, grid) };
}
