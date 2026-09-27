import { takeFromBag } from "./bag.js";
import type { GameState } from "./game.js";
import { canPlacePiece } from "./game.js";
import { spawnPiece } from "./piece.js";

export function swapHold(state: GameState): GameState {
  const piece = state.piece;
  if (piece === null) {
    return state;
  }
  if (state.holdLocked) {
    return state;
  }

  const activeKind = piece.kind;
  const holdPiece = state.holdPiece ?? null;

  if (holdPiece === null) {
    const promoted = spawnPiece(state.nextPiece);
    if (!canPlacePiece(promoted, state.grid)) {
      return state;
    }

    const next: GameState = {
      grid: state.grid,
      piece: promoted,
      nextPiece: state.nextPiece,
      holdPiece: activeKind,
      holdLocked: true,
    };
    if (state.bag !== undefined) {
      const drawn = takeFromBag(state.bag);
      next.nextPiece = drawn.kind;
      next.bag = drawn.bag;
    }
    return next;
  }

  const swappedIn = spawnPiece(holdPiece);
  if (!canPlacePiece(swappedIn, state.grid)) {
    return state;
  }

  return {
    grid: state.grid,
    piece: swappedIn,
    nextPiece: state.nextPiece,
    holdPiece: activeKind,
    holdLocked: true,
    ...(state.bag !== undefined ? { bag: state.bag } : {}),
  };
}
