import { takeFromBag, type BagState } from "./bag.js";
import { createEmptyPlayfield, isInsidePlayfield, type Playfield } from "./playfield.js";
import { stepDown } from "./gravity.js";
import { clearFullLines } from "./lines.js";
import {
  getPieceCells,
  spawnPiece,
  type ActivePiece,
  type PieceKind,
} from "./piece.js";

export type GameState = {
  grid: Playfield;
  piece: ActivePiece | null;
  nextPiece: PieceKind;
  bag?: BagState;
};

export type TickGravityResult = {
  state: GameState;
  linesCleared: number;
  gameOver: boolean;
};

export function createGameState(
  activeKind: PieceKind,
  nextKind: PieceKind,
  bag?: BagState,
): GameState {
  const state: GameState = {
    grid: createEmptyPlayfield(),
    piece: spawnPiece(activeKind),
    nextPiece: nextKind,
  };
  if (bag !== undefined) {
    state.bag = bag;
  }
  return state;
}

function canPlacePiece(piece: ActivePiece, grid: Playfield): boolean {
  for (const { x, y } of getPieceCells(piece)) {
    if (!isInsidePlayfield(x, y)) {
      return false;
    }
    if (grid[y][x] === "locked") {
      return false;
    }
  }
  return true;
}

export function tickGravity(state: GameState): TickGravityResult {
  const piece = state.piece;
  if (piece === null) {
    return { state, linesCleared: 0, gameOver: false };
  }

  const down = stepDown(piece, state.grid);
  if (down.piece !== null) {
    return {
      state: {
        grid: down.grid,
        piece: down.piece,
        nextPiece: state.nextPiece,
        ...(state.bag !== undefined ? { bag: state.bag } : {}),
      },
      linesCleared: 0,
      gameOver: false,
    };
  }

  return finishLockAndRespawn(down.grid, state.nextPiece, state.bag);
}

function finishLockAndRespawn(
  lockedGrid: Playfield,
  nextPiece: PieceKind,
  bag?: BagState,
): TickGravityResult {
  const { grid: clearedGrid, linesCleared } = clearFullLines(lockedGrid);
  const spawned = spawnPiece(nextPiece);

  if (!canPlacePiece(spawned, clearedGrid)) {
    return {
      state: {
        grid: clearedGrid,
        piece: null,
        nextPiece,
        ...(bag !== undefined ? { bag } : {}),
      },
      linesCleared,
      gameOver: true,
    };
  }

  if (bag !== undefined) {
    const drawn = takeFromBag(bag);
    return {
      state: {
        grid: clearedGrid,
        piece: spawned,
        nextPiece: drawn.kind,
        bag: drawn.bag,
      },
      linesCleared,
      gameOver: false,
    };
  }

  return {
    state: {
      grid: clearedGrid,
      piece: spawned,
      nextPiece,
    },
    linesCleared,
    gameOver: false,
  };
}

export function hardDrop(state: GameState): TickGravityResult {
  const piece = state.piece;
  if (piece === null) {
    return { state, linesCleared: 0, gameOver: false };
  }

  let current = piece;
  let grid = state.grid;
  for (;;) {
    const down = stepDown(current, grid);
    if (down.piece !== null) {
      current = down.piece;
      grid = down.grid;
      continue;
    }
    return finishLockAndRespawn(down.grid, state.nextPiece, state.bag);
  }
}
