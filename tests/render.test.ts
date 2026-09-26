import { describe, expect, it } from "vitest";
import {
  CELL_SIZE_PX,
  playfieldPixelSize,
  resizePlayfieldCanvas,
  renderGameState,
} from "../src/render.js";
import { PLAYFIELD_COLS, PLAYFIELD_ROWS, createEmptyPlayfield } from "../src/playfield.js";
import { createGameState, type GameState } from "../src/game.js";
import { getPieceCells, spawnPiece } from "../src/piece.js";

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

describe("playfieldPixelSize", () => {
  it("matches the standard playfield dimensions in pixels", () => {
    expect(playfieldPixelSize()).toEqual({
      width: PLAYFIELD_COLS * CELL_SIZE_PX,
      height: PLAYFIELD_ROWS * CELL_SIZE_PX,
    });
  });
});

describe("resizePlayfieldCanvas", () => {
  it("sets canvas width and height to the playfield pixel size", () => {
    const canvas = { width: 0, height: 0 };
    resizePlayfieldCanvas(canvas as HTMLCanvasElement);
    const size = playfieldPixelSize();
    expect(canvas.width).toBe(size.width);
    expect(canvas.height).toBe(size.height);
  });
});

describe("renderGameState", () => {
  it("draws a filled block for each locked cell", () => {
    const grid = createEmptyPlayfield();
    grid[10][2] = "locked";
    grid[11][4] = "locked";
    const state: GameState = { grid, piece: null, nextPiece: "O" };
    const { ctx, fills } = createRecordingContext();

    renderGameState(ctx, state);

    expect(cellFills(fills, 2, 10)).toHaveLength(1);
    expect(cellFills(fills, 4, 11)).toHaveLength(1);
  });

  it("draws the active piece cells on top of the playfield", () => {
    const state = createGameState("T", "O");
    const { ctx, fills } = createRecordingContext();

    renderGameState(ctx, state);

    for (const { x, y } of getPieceCells(state.piece!)) {
      expect(cellFills(fills, x, y)).toHaveLength(1);
    }
  });

  it("uses distinct fill styles for locked cells and the active piece", () => {
    const grid = createEmptyPlayfield();
    grid[19][0] = "locked";
    const state: GameState = {
      grid,
      piece: spawnPiece("T"),
      nextPiece: "O",
    };
    const { ctx, fills } = createRecordingContext();

    renderGameState(ctx, state);

    const lockedStyle = cellFills(fills, 0, 19)[0]?.style;
    const activeStyle = cellFills(fills, 3, 0)[0]?.style;
    expect(lockedStyle).toBeTruthy();
    expect(activeStyle).toBeTruthy();
    expect(lockedStyle).not.toBe(activeStyle);
  });

  it("paints the full canvas background before drawing cells", () => {
    const state = createGameState("O", "T");
    const { ctx, fills } = createRecordingContext();
    const { width, height } = playfieldPixelSize();

    renderGameState(ctx, state);

    expect(fills[0]).toMatchObject({ x: 0, y: 0, w: width, h: height });
  });
});
