import type { GameState } from "./game.js";
import type { ActivePiece } from "./piece.js";
import { tryMove } from "./movement.js";

export function computeGhostPiece(state: GameState): ActivePiece | null {
  const piece = state.piece;
  if (piece === null) {
    return null;
  }

  let ghost: ActivePiece = piece;
  for (;;) {
    const next = tryMove(ghost, state.grid, 0, 1);
    if (next === null) {
      return ghost;
    }
    ghost = next;
  }
}
