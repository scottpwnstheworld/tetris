import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ACTIVE_FILL,
  CELL_SIZE_PX,
  GHOST_FILL,
  LOCKED_FILL,
  renderGameState,
} from "../src/render.js";
import { createEmptyPlayfield } from "../src/playfield.js";
import { createGameState, type GameState } from "../src/game.js";
import { getPieceCells } from "../src/piece.js";
import { computeGhostPiece } from "../src/ghost.js";

type RecordedFill = {
  style: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

function createRecordingContext() {
  const fills: RecordedFill[] = [];
  const ctx = {
    fillStyle: "",
    fillRect(x: number, y: number, w: number, h: number) {
      fills.push({ style: ctx.fillStyle, x, y, w, h });
    },
  };
  return { ctx: ctx as CanvasRenderingContext2D, fills };
}

function cellFills(fills: RecordedFill[], x: number, y: number): RecordedFill[] {
  const px = x * CELL_SIZE_PX;
  const py = y * CELL_SIZE_PX;
  return fills.filter(
    (f) =>
      f.x === px &&
      f.y === py &&
      f.w === CELL_SIZE_PX &&
      f.h === CELL_SIZE_PX,
  );
}

describe("ghost fill constants", () => {
  it("exposes a ghost fill distinct from locked and active piece fills", () => {
    expect(GHOST_FILL).toBeTruthy();
    expect(GHOST_FILL).not.toBe(LOCKED_FILL);
    expect(GHOST_FILL).not.toBe(ACTIVE_FILL);
  });
});

describe("renderGameState ghost piece", () => {
  it("draws ghost cells at the projected landing pose", () => {
    const state = createGameState("T", "O");
    const ghost = computeGhostPiece(state);
    expect(ghost).not.toBeNull();

    const { ctx, fills } = createRecordingContext();
    renderGameState(ctx, state);

    for (const { x, y } of getPieceCells(ghost!)) {
      const ghostFills = cellFills(fills, x, y);
      expect(ghostFills.some((f) => f.style === GHOST_FILL)).toBe(true);
    }
  });

  it("paints ghost after locked cells and before the active piece", () => {
    const grid = createEmptyPlayfield();
    grid[19][0] = "locked";
    const state: GameState = createGameState("T", "O");
    state.grid = grid;
    const ghost = computeGhostPiece(state);
    expect(ghost).not.toBeNull();

    const active = state.piece!;
    const ghostCell = getPieceCells(ghost!)[0];
    const activeCell = getPieceCells(active)[0];

    const { ctx, fills } = createRecordingContext();
    renderGameState(ctx, state);

    const lockedIndex = fills.findIndex(
      (f) => f.style === LOCKED_FILL && f.x === 0 && f.y === 19 * CELL_SIZE_PX,
    );
    const ghostIndex = fills.findIndex(
      (f) =>
        f.style === GHOST_FILL &&
        f.x === ghostCell.x * CELL_SIZE_PX &&
        f.y === ghostCell.y * CELL_SIZE_PX,
    );
    const activeIndex = fills.findIndex(
      (f) =>
        f.style === ACTIVE_FILL &&
        f.x === activeCell.x * CELL_SIZE_PX &&
        f.y === activeCell.y * CELL_SIZE_PX,
    );

    expect(lockedIndex).toBeGreaterThanOrEqual(0);
    expect(ghostIndex).toBeGreaterThan(lockedIndex);
    expect(activeIndex).toBeGreaterThan(ghostIndex);
  });

  it("does not draw ghost fills when there is no active piece", () => {
    const grid = createEmptyPlayfield();
    const state: GameState = { grid, piece: null, nextPiece: "O" };
    const { ctx, fills } = createRecordingContext();

    renderGameState(ctx, state);

    expect(fills.some((f) => f.style === GHOST_FILL)).toBe(false);
  });
});

describe("ghost render wiring", () => {
  it("render.ts delegates landing projection to computeGhostPiece", () => {
    const source = readFileSync("src/render.ts", "utf8");
    expect(source).toMatch(/from\s+["']\.\/ghost\.js["']/);
    expect(source).toMatch(/computeGhostPiece\s*\(/);
  });
});
