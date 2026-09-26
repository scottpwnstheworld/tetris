import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createEmptyPlayfield, type Playfield } from "../src/playfield.js";
import { spawnPiece } from "../src/piece.js";
import { createGameState, type GameState } from "../src/game.js";
import {
  createPlaySession,
  handlePlayKey,
  stepPlayGravity,
  type PlaySession,
} from "../src/session.js";

function playfieldWithLocked(cells: ReadonlyArray<readonly [number, number]>): Playfield {
  const grid = createEmptyPlayfield();
  for (const [x, y] of cells) {
    grid[y][x] = "locked";
  }
  return grid;
}

describe("createPlaySession", () => {
  it("starts in play with a spawned active piece on an empty grid", () => {
    const session = createPlaySession();

    expect(session.gameOver).toBe(false);
    expect(session.state.piece).not.toBeNull();
    expect(session.state.grid.every((row) => row.every((cell) => cell === null))).toBe(
      true,
    );
  });

  it("queues the demo next piece kind for the preview panel", () => {
    const session = createPlaySession();

    expect(session.state.piece!.kind).toBe("T");
    expect(session.state.nextPiece).toBe("O");
  });
});

describe("handlePlayKey", () => {
  it("moves the active piece left on ArrowLeft", () => {
    const before = createPlaySession();
    const after = handlePlayKey(before, "ArrowLeft");

    expect(after.gameOver).toBe(false);
    expect(after.state.piece!.x).toBe(before.state.piece!.x - 1);
  });

  it("rotates the active piece one step counter-clockwise on ArrowUp", () => {
    const before = createPlaySession();
    const after = handlePlayKey(before, "ArrowUp");

    expect(after.gameOver).toBe(false);
    expect(after.state.piece!.kind).toBe("T");
    expect(after.state.piece!.rotation).toBe(3);
  });

  it("ignores unknown keys without changing state", () => {
    const before = createPlaySession();
    const after = handlePlayKey(before, "KeyQ");

    expect(after).toEqual(before);
  });

  it("does not accept input after game over", () => {
    const ended: PlaySession = {
      state: {
        grid: createEmptyPlayfield(),
        piece: null,
        nextPiece: "T",
      },
      gameOver: true,
    };
    const after = handlePlayKey(ended, "ArrowLeft");

    expect(after).toEqual(ended);
  });
});

describe("stepPlayGravity", () => {
  it("drops the active piece one row when space is clear", () => {
    const before = createPlaySession();
    const result = stepPlayGravity(before);

    expect(result.gameOver).toBe(false);
    expect(result.linesCleared).toBe(0);
    expect(result.state.piece!.y).toBe(before.state.piece!.y + 1);
  });

  it("locks, clears lines, and respawns on a blocked drop", () => {
    const grid = createEmptyPlayfield();
    for (let x = 0; x < 10; x += 1) {
      if (x !== 4) {
        grid[19][x] = "locked";
      }
    }
    const onFloor = { ...spawnPiece("I"), x: 3, y: 19 };
    const before: PlaySession = {
      state: { grid, piece: onFloor, nextPiece: "T" },
      gameOver: false,
    };

    const result = stepPlayGravity(before);

    expect(result.gameOver).toBe(false);
    expect(result.linesCleared).toBe(1);
    expect(result.state.piece).toEqual(spawnPiece("T"));
  });

  it("marks game over when the next piece cannot spawn", () => {
    const grid = playfieldWithLocked([
      [3, 0],
      [4, 0],
      [5, 0],
      [3, 1],
      [4, 1],
      [5, 1],
    ]);
    const before: PlaySession = {
      state: createGameState("O", "T"),
      gameOver: false,
    };
    const session: PlaySession = { ...before, state: { ...before.state, grid } };
    const onFloor = { ...spawnPiece("O"), x: 4, y: 18 };
    const stacked: PlaySession = {
      ...session,
      state: { ...session.state, piece: onFloor },
    };

    const result = stepPlayGravity(stacked);

    expect(result.gameOver).toBe(true);
    expect(result.state.piece).toBeNull();
  });
});

describe("dev preview entry", () => {
  it("exposes a playfield canvas in index.html for the Vite bundle", () => {
    const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
    expect(html).toMatch(/<canvas[^>]*\bid=["']playfield["']/i);
  });
});
