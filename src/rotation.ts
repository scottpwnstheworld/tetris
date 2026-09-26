import { isInsidePlayfield, type Playfield } from "./playfield.js";
import { getPieceCells, type ActivePiece } from "./piece.js";

export type RotateDirection = "cw" | "ccw";

const WALL_KICKS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [-1, 0],
  [1, 0],
  [-2, 0],
  [2, 0],
  [0, -1],
  [1, -1],
  [-1, -1],
];

function nextRotation(rotation: number, direction: RotateDirection): number {
  const delta = direction === "cw" ? 1 : 3;
  return (rotation + delta) % 4;
}

type PlacementFailure = "ok" | "locked" | "bounds";

function placementFailure(piece: ActivePiece, grid: Playfield): PlacementFailure {
  let outOfBounds = false;
  for (const { x, y } of getPieceCells(piece)) {
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

export function tryRotate(
  piece: ActivePiece,
  grid: Playfield,
  direction: RotateDirection,
): ActivePiece | null {
  const rotation = piece.rotation ?? 0;
  const nextRot = nextRotation(rotation, direction);

  const nominal: ActivePiece = {
    kind: piece.kind,
    x: piece.x,
    y: piece.y,
    rotation: nextRot,
  };

  const nominalResult = placementFailure(nominal, grid);
  if (nominalResult === "ok") {
    return nominal;
  }
  if (nominalResult === "locked") {
    return null;
  }

  for (const [dx, dy] of WALL_KICKS) {
    if (dx === 0 && dy === 0) {
      continue;
    }
    const candidate: ActivePiece = {
      kind: piece.kind,
      x: piece.x + dx,
      y: piece.y + dy,
      rotation: nextRot,
    };
    if (placementFailure(candidate, grid) === "ok") {
      return candidate;
    }
  }

  return null;
}
