import { createBagState, DEFAULT_BAG_SEED, takeFromBag } from "./bag.js";
import { createGameState, hardDrop, tickGravity, type GameState } from "./game.js";
import { swapHold } from "./hold.js";
import { moveActivePiece, rotateActivePieceCounterClockwise } from "./input.js";
import { addLineClearScore } from "./score.js";

export type PlaySession = {
  state: GameState;
  gameOver: boolean;
  score: number;
  totalLinesCleared: number;
  paused: boolean;
};

function scoreAfterLineClear(session: PlaySession, linesCleared: number): number {
  const current = session.score ?? 0;
  if (linesCleared <= 0) {
    return current;
  }
  return addLineClearScore(current, linesCleared);
}

function totalLinesAfterClear(session: PlaySession, linesCleared: number): number {
  return session.totalLinesCleared + linesCleared;
}

export type StepPlayGravityResult = PlaySession & {
  linesCleared: number;
};

export type PlayActionResult = PlaySession & {
  linesCleared: number;
};

export function createPlaySession(): PlaySession {
  const first = takeFromBag(createBagState(DEFAULT_BAG_SEED));
  const second = takeFromBag(first.bag);
  return {
    state: createGameState(first.kind, second.kind, second.bag),
    gameOver: false,
    score: 0,
    totalLinesCleared: 0,
    paused: false,
  };
}

export function togglePlayPause(session: PlaySession): PlaySession {
  if (session.gameOver) {
    return session;
  }
  return {
    ...session,
    paused: !session.paused,
  };
}

export function restartPlaySession(session: PlaySession): PlaySession {
  if (!session.gameOver) {
    return session;
  }
  return createPlaySession();
}

export function handlePlayKey(session: PlaySession, key: string): PlaySession {
  if (session.gameOver) {
    if (key === "Enter") {
      return restartPlaySession(session);
    }
    return session;
  }

  if (key === "Enter") {
    return session;
  }

  if (session.paused && key !== "Escape") {
    return session;
  }

  let nextState: GameState;
  switch (key) {
    case "Escape":
      return togglePlayPause(session);
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
    case "KeyC":
      nextState = swapHold(session.state);
      break;
    default:
      return session;
  }

  return {
    state: nextState,
    gameOver: false,
    score: session.score ?? 0,
    totalLinesCleared: session.totalLinesCleared,
    paused: session.paused,
  };
}

export function handlePlayAction(
  session: PlaySession,
  action: string,
): PlaySession | PlayActionResult {
  if (session.gameOver && action !== "restart") {
    return session;
  }

  if (session.paused && action === "hard-drop") {
    return session;
  }

  switch (action) {
    case "pause": {
      const next = togglePlayPause(session);
      return { ...next, linesCleared: 0 };
    }
    case "restart": {
      if (!session.gameOver) {
        return session;
      }
      const restarted = restartPlaySession(session);
      return { ...restarted, linesCleared: 0 };
    }
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
        totalLinesCleared: totalLinesAfterClear(session, result.linesCleared),
        paused: session.paused,
      };
    }
    case "hold": {
      const nextState = swapHold(session.state);
      if (nextState === session.state) {
        return session;
      }
      return {
        state: nextState,
        gameOver: false,
        linesCleared: 0,
        score: session.score ?? 0,
        totalLinesCleared: session.totalLinesCleared,
        paused: session.paused,
      };
    }
    default:
      return session;
  }
}

export function stepPlayGravity(session: PlaySession): StepPlayGravityResult {
  if (session.paused) {
    return { ...session, linesCleared: 0 };
  }
  const result = tickGravity(session.state);
  return {
    state: result.state,
    gameOver: result.gameOver,
    linesCleared: result.linesCleared,
    score: scoreAfterLineClear(session, result.linesCleared),
    totalLinesCleared: totalLinesAfterClear(session, result.linesCleared),
    paused: session.paused,
  };
}
