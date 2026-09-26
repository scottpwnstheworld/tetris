import type { GameState } from "./game.js";
import { tryMove } from "./movement.js";

export function moveActivePiece(state: GameState, dx: number, dy: number): GameState {
  const piece = state.piece;
  if (piece === null) {
    return state;
  }

  const moved = tryMove(piece, state.grid, dx, dy);
  if (moved === null) {
    return {
      grid: state.grid,
      piece,
      nextPiece: state.nextPiece,
    };
  }

  return {
    grid: state.grid,
    piece: moved,
    nextPiece: state.nextPiece,
  };
}
