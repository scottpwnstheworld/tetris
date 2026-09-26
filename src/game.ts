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
};

export type TickGravityResult = {
  state: GameState;
  linesCleared: number;
  gameOver: boolean;
};

export function createGameState(activeKind: PieceKind, nextKind: PieceKind): GameState {
  return {
    grid: createEmptyPlayfield(),
    piece: spawnPiece(activeKind),
    nextPiece: nextKind,
  };
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
      },
      linesCleared: 0,
      gameOver: false,
    };
  }

  const { grid: clearedGrid, linesCleared } = clearFullLines(down.grid);
  const spawned = spawnPiece(state.nextPiece);

  if (!canPlacePiece(spawned, clearedGrid)) {
    return {
      state: {
        grid: clearedGrid,
        piece: null,
        nextPiece: state.nextPiece,
      },
      linesCleared,
      gameOver: true,
    };
  }

  return {
    state: {
      grid: clearedGrid,
      piece: spawned,
      nextPiece: state.nextPiece,
    },
    linesCleared,
    gameOver: false,
  };
}
