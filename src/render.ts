import { PLAYFIELD_COLS, PLAYFIELD_ROWS } from "./playfield.js";
import type { GameState } from "./game.js";
import { getPieceCells } from "./piece.js";

export const CELL_SIZE_PX = 24;

const BACKGROUND_FILL = "#12151c";
const LOCKED_FILL = "#3d6b9e";
const ACTIVE_FILL = "#e6c84b";

export function playfieldPixelSize(): { width: number; height: number } {
  return {
    width: PLAYFIELD_COLS * CELL_SIZE_PX,
    height: PLAYFIELD_ROWS * CELL_SIZE_PX,
  };
}

export function resizePlayfieldCanvas(canvas: HTMLCanvasElement): void {
  const { width, height } = playfieldPixelSize();
  canvas.width = width;
  canvas.height = height;
}

export function renderGameState(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { width, height } = playfieldPixelSize();

  ctx.fillStyle = BACKGROUND_FILL;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = LOCKED_FILL;
  for (let y = 0; y < PLAYFIELD_ROWS; y += 1) {
    for (let x = 0; x < PLAYFIELD_COLS; x += 1) {
      if (state.grid[y][x] === "locked") {
        ctx.fillRect(x * CELL_SIZE_PX, y * CELL_SIZE_PX, CELL_SIZE_PX, CELL_SIZE_PX);
      }
    }
  }

  const piece = state.piece;
  if (piece !== null) {
    ctx.fillStyle = ACTIVE_FILL;
    for (const { x, y } of getPieceCells(piece)) {
      ctx.fillRect(x * CELL_SIZE_PX, y * CELL_SIZE_PX, CELL_SIZE_PX, CELL_SIZE_PX);
    }
  }
}
