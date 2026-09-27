import type { GameState } from "./game.js";
import type { ActivePiece } from "./piece.js";
import { tryMove } from "./movement.js";
import { tryRotate, type RotateDirection } from "./rotation.js";

function stateWithPiece(state: GameState, piece: ActivePiece): GameState {
  return {
    grid: state.grid,
    piece,
    nextPiece: state.nextPiece,
    bag: state.bag,
    holdPiece: state.holdPiece,
    holdLocked: state.holdLocked,
  };
}

export function moveActivePiece(state: GameState, dx: number, dy: number): GameState {
  const piece = state.piece;
  if (piece === null) {
    return state;
  }

  const moved = tryMove(piece, state.grid, dx, dy);
  if (moved === null) {
    return stateWithPiece(state, piece);
  }

  return stateWithPiece(state, moved);
}

export function rotateActivePieceCounterClockwise(state: GameState): GameState {
  return rotateActivePiece(state, "ccw");
}

export function rotateActivePiece(state: GameState, direction: RotateDirection): GameState {
  const piece = state.piece;
  if (piece === null) {
    return state;
  }

  const rotated = tryRotate(piece, state.grid, direction);
  if (rotated === null) {
    return stateWithPiece(state, piece);
  }

  return stateWithPiece(state, rotated);
}
