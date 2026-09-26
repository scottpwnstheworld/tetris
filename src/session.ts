import { createGameState, hardDrop, tickGravity, type GameState } from "./game.js";
import { moveActivePiece, rotateActivePieceCounterClockwise } from "./input.js";
import { addLineClearScore } from "./score.js";

export type PlaySession = {
  state: GameState;
  gameOver: boolean;
  score: number;
};

function scoreAfterLineClear(session: PlaySession, linesCleared: number): number {
  const current = session.score ?? 0;
  if (linesCleared <= 0) {
    return current;
  }
  return addLineClearScore(current, linesCleared);
}

export type StepPlayGravityResult = PlaySession & {
  linesCleared: number;
};

export type PlayActionResult = PlaySession & {
  linesCleared: number;
};

export function createPlaySession(): PlaySession {
  return {
    state: createGameState("T", "O"),
    gameOver: false,
    score: 0,
  };
}

export function handlePlayKey(session: PlaySession, key: string): PlaySession {
  if (session.gameOver) {
    return session;
  }

  let nextState: GameState;
  switch (key) {
    case "ArrowLeft":
      nextState = moveActivePiece(session.state, -1, 0);
      break;
    case "ArrowRight":
      nextState = moveActivePiece(session.state, 1, 0);
      break;
    case "ArrowDown":
      nextState = moveActivePiece(session.state, 0, 1);
      break;
    case "ArrowUp":
      nextState = rotateActivePieceCounterClockwise(session.state);
      break;
    default:
      return session;
  }

  return {
    state: nextState,
    gameOver: false,
    score: session.score ?? 0,
  };
}

export function handlePlayAction(
  session: PlaySession,
  action: string,
): PlaySession | PlayActionResult {
  if (session.gameOver) {
    return session;
  }

  switch (action) {
    case "rotate-ccw": {
      const next = handlePlayKey(session, "ArrowUp");
      return { ...next, linesCleared: 0 };
    }
    case "hard-drop": {
      const result = hardDrop(session.state);
      return {
        state: result.state,
        gameOver: result.gameOver,
        linesCleared: result.linesCleared,
        score: scoreAfterLineClear(session, result.linesCleared),
      };
    }
    default:
      return session;
  }
}

export function stepPlayGravity(session: PlaySession): StepPlayGravityResult {
  const result = tickGravity(session.state);
  return {
    state: result.state,
    gameOver: result.gameOver,
    linesCleared: result.linesCleared,
    score: scoreAfterLineClear(session, result.linesCleared),
  };
}
