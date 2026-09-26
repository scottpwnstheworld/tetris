import type { GameState } from "./game.js";
import { tryMove } from "./movement.js";
import { tryRotate, type RotateDirection } from "./rotation.js";

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

export function rotateActivePieceClockwise(state: GameState): GameState {
  return rotateActivePiece(state, "cw");
}

export function rotateActivePiece(state: GameState, direction: RotateDirection): GameState {
  const piece = state.piece;
  if (piece === null) {
    return state;
  }

  const rotated = tryRotate(piece, state.grid, direction);
  if (rotated === null) {
    return {
      grid: state.grid,
      piece,
      nextPiece: state.nextPiece,
    };
  }

  return {
    grid: state.grid,
    piece: rotated,
    nextPiece: state.nextPiece,
  };
}
