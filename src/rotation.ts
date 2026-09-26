import type { Playfield } from "./playfield.js";
import type { ActivePiece } from "./piece.js";
import { attemptRotate, type RotateDirection } from "./rotation-system.js";

export type { RotateDirection } from "./rotation-system.js";

export function tryRotate(
  piece: ActivePiece,
  grid: Playfield,
  direction: RotateDirection,
): ActivePiece | null {
  const rotation = piece.rotation ?? 0;
  const pose = {
    kind: piece.kind,
    x: piece.x,
    y: piece.y,
    rotation,
  };
  const result = attemptRotate(pose, grid, direction);
  if (result === null) {
    return null;
  }
  return {
    kind: result.kind,
    x: result.x,
    y: result.y,
    rotation: result.rotation,
  };
}
