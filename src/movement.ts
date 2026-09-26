import { isInsidePlayfield, type Playfield } from "./playfield.js";
import { getPieceCells, type ActivePiece } from "./piece.js";

export function tryMove(
  piece: ActivePiece,
  grid: Playfield,
  dx: number,
  dy: number,
): ActivePiece | null {
  const moved: ActivePiece = {
    kind: piece.kind,
    x: piece.x + dx,
    y: piece.y + dy,
    rotation: piece.rotation ?? 0,
  };

  for (const { x, y } of getPieceCells(moved)) {
    if (!isInsidePlayfield(x, y)) {
      return null;
    }
    if (grid[y][x] === "locked") {
      return null;
    }
  }

  return moved;
}
