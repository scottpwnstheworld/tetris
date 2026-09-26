import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createEmptyPlayfield } from "../src/playfield.js";
import { spawnPiece } from "../src/piece.js";
import { createGameState, hardDrop } from "../src/game.js";
import {
  createPlaySession,
  handlePlayAction,
  handlePlayKey,
  type PlaySession,
} from "../src/session.js";
import { moveActivePiece } from "../src/input.js";

function lowestYAfterSoftDrops(state: ReturnType<typeof createGameState>) {
  let current = state;
  for (let i = 0; i < 25; i += 1) {
    const next = moveActivePiece(current, 0, 1);
    if (next.piece === current.piece && next.piece!.y === current.piece!.y) {
      break;
    }
    current = next;
  }
  return current.piece!.y;
}

describe("hardDrop", () => {
  it("locks the active piece at the lowest valid row and spawns the queued next kind", () => {
    const before = createGameState("T", "O");
    const result = hardDrop(before);

    expect(result.gameOver).toBe(false);
    expect(result.linesCleared).toBe(0);
    expect(result.state.piece).toEqual(spawnPiece("O"));
    expect(result.state.nextPiece).toBe("O");

    const lockedYs = new Set<number>();
    for (let y = 0; y < before.grid.length; y += 1) {
      for (let x = 0; x < before.grid[y].length; x += 1) {
        if (result.state.grid[y][x] === "locked") {
          lockedYs.add(y);
        }
      }
    }
    expect(lockedYs.size).toBeGreaterThan(0);
    expect(Math.max(...lockedYs)).toBe(19);
  });

  it("lands at the same row as repeated soft drops before locking", () => {
    const before = createGameState("T", "O");
    const expectedY = lowestYAfterSoftDrops(before);
    const result = hardDrop(before);

    expect(result.state.piece!.y).toBe(0);
    expect(result.state.piece!.kind).toBe("O");

    let maxLockedY = -1;
    for (let y = 0; y < result.state.grid.length; y += 1) {
      for (let x = 0; x < result.state.grid[y].length; x += 1) {
        if (result.state.grid[y][x] === "locked") {
          maxLockedY = Math.max(maxLockedY, y);
        }
      }
    }
    expect(maxLockedY).toBe(expectedY + 1);
  });

  it("clears full lines and reports linesCleared after the drop locks", () => {
    const grid = createEmptyPlayfield();
    for (let x = 0; x < 10; x += 1) {
      if (x !== 4) {
        grid[19][x] = "locked";
      }
    }
    const onFloor = { ...spawnPiece("I"), x: 3, y: 19 };
    const before = {
      grid,
      piece: onFloor,
      nextPiece: "T" as const,
    };

    const result = hardDrop(before);

    expect(result.gameOver).toBe(false);
    expect(result.linesCleared).toBe(1);
    expect(result.state.piece).toEqual(spawnPiece("T"));
  });

  it("returns the same state when there is no active piece", () => {
    const before = createGameState("T", "O");
    const ended = { ...before, piece: null };
    const result = hardDrop(ended);

    expect(result).toEqual({
      state: ended,
      linesCleared: 0,
      gameOver: false,
    });
  });
});

describe("handlePlayAction", () => {
  it("rotates counter-clockwise on rotate-ccw like ArrowUp", () => {
    const before = createPlaySession();
    const fromKey = handlePlayKey(before, "ArrowUp");
    const fromMobile = handlePlayAction(before, "rotate-ccw");

    expect(fromMobile).toEqual({ ...fromKey, linesCleared: 0 });
  });

  it("hard-drops the active piece on hard-drop", () => {
    const before = createPlaySession();
    const after = handlePlayAction(before, "hard-drop");

    expect(after.gameOver).toBe(false);
    expect(after.linesCleared).toBe(0);
    expect(after.state.piece!.kind).toBe("O");
    expect(
      after.state.grid.some((row) => row.some((cell) => cell === "locked")),
    ).toBe(true);
  });

  it("ignores unknown actions without changing the session", () => {
    const before = createPlaySession();
    const dispatch = handlePlayAction as (
      session: PlaySession,
      action: string,
    ) => PlaySession & { linesCleared: number };
    const after = dispatch(before, "swipe-left");

    expect(after).toEqual(before);
  });

  it("does not accept mobile actions after game over", () => {
    const ended: PlaySession = {
      state: {
        grid: createEmptyPlayfield(),
        piece: null,
        nextPiece: "T",
      },
      gameOver: true,
    };
    const afterRotate = handlePlayAction(ended, "rotate-ccw");
    const afterDrop = handlePlayAction(ended, "hard-drop");

    expect(afterRotate).toEqual(ended);
    expect(afterDrop).toEqual(ended);
  });
});

describe("mobile touch controls wiring", () => {
  it("exposes rotate and drop touch buttons in index.html", () => {
    const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
    expect(html).toMatch(/data-play-action=["']rotate-ccw["']/i);
    expect(html).toMatch(/data-play-action=["']hard-drop["']/i);
    expect(html).toMatch(/type=["']button["']/i);
  });

  it("routes mobile control events through handlePlayAction in main.ts", () => {
    const mainSource = readFileSync(new URL("../src/main.ts", import.meta.url), "utf8");
    expect(mainSource).toMatch(/handlePlayAction\s*\(/);
    expect(mainSource).toMatch(/data-play-action/);
    expect(mainSource).toMatch(/touchstart|pointerdown|click/);
  });

  it("implements handlePlayAction in session.ts for mobile play actions", () => {
    const sessionSource = readFileSync(new URL("../src/session.ts", import.meta.url), "utf8");
    expect(sessionSource).toMatch(/export\s+function\s+handlePlayAction/);
    expect(sessionSource).toMatch(/hard-drop/);
    expect(sessionSource).toMatch(/rotate-ccw/);
  });
});
