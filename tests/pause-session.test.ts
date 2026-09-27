import { describe, expect, it } from "vitest";
import { createEmptyPlayfield } from "../src/playfield.js";
import {
  createPlaySession,
  handlePlayAction,
  handlePlayKey,
  restartPlaySession,
  stepPlayGravity,
  togglePlayPause,
  type PlaySession,
} from "../src/session.js";

function endedSession(): PlaySession {
  return {
    state: {
      grid: createEmptyPlayfield(),
      piece: null,
      nextPiece: "T",
    },
    gameOver: true,
    score: 400,
    totalLinesCleared: 12,
    paused: false,
  };
}

describe("createPlaySession pause defaults", () => {
  it("starts with pause off so gravity and input run normally", () => {
    const session = createPlaySession();
    expect(session.paused).toBe(false);
  });
});

describe("togglePlayPause", () => {
  it("pauses an active session without ending the game", () => {
    const before = createPlaySession();
    const after = togglePlayPause(before);

    expect(after.gameOver).toBe(false);
    expect(after.paused).toBe(true);
    expect(after.state).toEqual(before.state);
    expect(after.score).toBe(before.score);
    expect(after.totalLinesCleared).toBe(before.totalLinesCleared);
  });

  it("resumes when pause is already on", () => {
    const paused = { ...createPlaySession(), paused: true };
    const after = togglePlayPause(paused);

    expect(after.paused).toBe(false);
    expect(after.gameOver).toBe(false);
  });

  it("returns the same session reference after game over", () => {
    const ended = endedSession();
    const after = togglePlayPause(ended);
    expect(after).toBe(ended);
  });
});

describe("handlePlayKey pause", () => {
  it("toggles pause on Escape during active play", () => {
    const before = createPlaySession();
    const paused = handlePlayKey(before, "Escape");
    const resumed = handlePlayKey(paused, "Escape");

    expect(paused.paused).toBe(true);
    expect(resumed.paused).toBe(false);
  });

  it("ignores movement keys while paused", () => {
    const paused: PlaySession = { ...createPlaySession(), paused: true };
    const after = handlePlayKey(paused, "ArrowLeft");

    expect(after).toBe(paused);
    expect(after.state.piece).toEqual(paused.state.piece);
  });

  it("ignores Escape when the game is over", () => {
    const ended = endedSession();
    const after = handlePlayKey(ended, "Escape");
    expect(after).toBe(ended);
  });
});

describe("stepPlayGravity while paused", () => {
  it("does not advance gravity or change the board", () => {
    const paused: PlaySession = { ...createPlaySession(), paused: true };
    const yBefore = paused.state.piece!.y;
    const result = stepPlayGravity(paused);

    expect(result.linesCleared).toBe(0);
    expect(result.paused).toBe(true);
    expect(result.state.piece!.y).toBe(yBefore);
    expect(result.score).toBe(paused.score);
    expect(result.totalLinesCleared).toBe(paused.totalLinesCleared);
  });
});

describe("handlePlayAction pause", () => {
  it("toggles pause through the touch action", () => {
    const before = createPlaySession();
    const paused = handlePlayAction(before, "pause");
    const resumed = handlePlayAction(paused, "pause");

    expect(paused).toMatchObject({ paused: true, gameOver: false });
    if ("linesCleared" in paused) {
      expect(paused.linesCleared).toBe(0);
    }
    expect(resumed).toMatchObject({ paused: false, gameOver: false });
  });

  it("does not hard-drop while paused", () => {
    const paused: PlaySession = { ...createPlaySession(), paused: true };
    const after = handlePlayAction(paused, "hard-drop");
    expect(after).toBe(paused);
  });
});

describe("restartPlaySession pause reset", () => {
  it("clears pause when starting a new game after game over", () => {
    const ended = { ...endedSession(), paused: true };
    const after = restartPlaySession(ended);

    expect(after.paused).toBe(false);
    expect(after.gameOver).toBe(false);
  });
});
