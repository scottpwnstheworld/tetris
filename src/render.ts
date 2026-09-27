import { PLAYFIELD_COLS, PLAYFIELD_ROWS } from "./playfield.js";
import type { GameState } from "./game.js";
import { computeGhostPiece } from "./ghost.js";
import { getPieceCells, spawnPiece, type PieceKind } from "./piece.js";

export const CELL_SIZE_PX = 24;

export const NEXT_PREVIEW_COLS = 4;
export const NEXT_PREVIEW_ROWS = 4;
export const NEXT_PREVIEW_FILL = "#5a9e7a";
export const HOLD_PREVIEW_FILL = "#7a5a9e";

const BACKGROUND_FILL = "#12151c";
export const LOCKED_FILL = "#3d6b9e";
export const ACTIVE_FILL = "#e6c84b";
export const GHOST_FILL = "#6b5a3a";

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

export function nextPreviewPixelSize(): { width: number; height: number } {
  return {
    width: NEXT_PREVIEW_COLS * CELL_SIZE_PX,
    height: NEXT_PREVIEW_ROWS * CELL_SIZE_PX,
  };
}

export function resizeNextPreviewCanvas(canvas: HTMLCanvasElement): void {
  const { width, height } = nextPreviewPixelSize();
  canvas.width = width;
  canvas.height = height;
}

export function resizeHoldPreviewCanvas(canvas: HTMLCanvasElement): void {
  const { width, height } = nextPreviewPixelSize();
  canvas.width = width;
  canvas.height = height;
}

export function nextPreviewCells(
  kind: PieceKind,
): ReadonlyArray<{ x: number; y: number }> {
  const piece = spawnPiece(kind);
  const local = getPieceCells(piece).map(({ x, y }) => ({
    x: x - piece.x,
    y: y - piece.y,
  }));

  let minX = local[0].x;
  let maxX = local[0].x;
  let minY = local[0].y;
  let maxY = local[0].y;
  for (const { x, y } of local) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const offsetX = Math.floor((NEXT_PREVIEW_COLS - width) / 2) - minX;
  const offsetY = Math.floor((NEXT_PREVIEW_ROWS - height) / 2) - minY;

  return local.map(({ x, y }) => ({
    x: x + offsetX,
    y: y + offsetY,
  }));
}

export function renderHoldPiecePreview(
  ctx: CanvasRenderingContext2D,
  kind: PieceKind | null,
): void {
  const { width, height } = nextPreviewPixelSize();

  ctx.fillStyle = BACKGROUND_FILL;
  ctx.fillRect(0, 0, width, height);

  if (kind === null) {
    return;
  }

  ctx.fillStyle = HOLD_PREVIEW_FILL;
  for (const { x, y } of nextPreviewCells(kind)) {
    ctx.fillRect(x * CELL_SIZE_PX, y * CELL_SIZE_PX, CELL_SIZE_PX, CELL_SIZE_PX);
  }
}

export function renderNextPiecePreview(
  ctx: CanvasRenderingContext2D,
  kind: PieceKind,
): void {
  const { width, height } = nextPreviewPixelSize();

  ctx.fillStyle = BACKGROUND_FILL;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = NEXT_PREVIEW_FILL;
  for (const { x, y } of nextPreviewCells(kind)) {
    ctx.fillRect(x * CELL_SIZE_PX, y * CELL_SIZE_PX, CELL_SIZE_PX, CELL_SIZE_PX);
  }
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
    const ghost = computeGhostPiece(state);
    if (ghost !== null) {
      ctx.fillStyle = GHOST_FILL;
      for (const { x, y } of getPieceCells(ghost)) {
        ctx.fillRect(x * CELL_SIZE_PX, y * CELL_SIZE_PX, CELL_SIZE_PX, CELL_SIZE_PX);
      }
    }

    ctx.fillStyle = ACTIVE_FILL;
    for (const { x, y } of getPieceCells(piece)) {
      ctx.fillRect(x * CELL_SIZE_PX, y * CELL_SIZE_PX, CELL_SIZE_PX, CELL_SIZE_PX);
    }
  }
}

export function formatScoreText(score: number): string {
  return `Score: ${score}`;
}

export function formatLevelText(level: number): string {
  return `Level: ${level}`;
}
