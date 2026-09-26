import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CELL_SIZE_PX,
  NEXT_PREVIEW_COLS,
  NEXT_PREVIEW_FILL,
  NEXT_PREVIEW_ROWS,
  nextPreviewCells,
  nextPreviewPixelSize,
  renderNextPiecePreview,
  resizeNextPreviewCanvas,
} from "../src/render.js";
import type { PieceKind } from "../src/piece.js";

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

function previewCellFills(fills: RecordedFill[], x: number, y: number): RecordedFill[] {
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

const ALL_KINDS: PieceKind[] = ["I", "O", "T", "S", "Z", "J", "L"];

describe("next preview layout", () => {
  it("uses a 4×4 mini-grid at the same cell size as the playfield", () => {
    expect(NEXT_PREVIEW_COLS).toBe(4);
    expect(NEXT_PREVIEW_ROWS).toBe(4);
    expect(nextPreviewPixelSize()).toEqual({
      width: NEXT_PREVIEW_COLS * CELL_SIZE_PX,
      height: NEXT_PREVIEW_ROWS * CELL_SIZE_PX,
    });
  });

  it("resizes the preview canvas to the preview pixel size", () => {
    const canvas = { width: 0, height: 0 };
    resizeNextPreviewCanvas(canvas as HTMLCanvasElement);
    const size = nextPreviewPixelSize();
    expect(canvas.width).toBe(size.width);
    expect(canvas.height).toBe(size.height);
  });
});

describe("nextPreviewCells", () => {
  it("centers the O spawn footprint in the preview grid", () => {
    expect(nextPreviewCells("O")).toEqual([
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
    ]);
  });

  it("centers the I spawn footprint in the preview grid", () => {
    expect(nextPreviewCells("I")).toEqual([
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
    ]);
  });

  it("centers the T spawn footprint in the preview grid", () => {
    expect(nextPreviewCells("T")).toEqual([
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
    ]);
  });

  it("returns four in-bounds cells for every standard kind", () => {
    for (const kind of ALL_KINDS) {
      const cells = nextPreviewCells(kind);
      expect(cells).toHaveLength(4);
      for (const { x, y } of cells) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThan(NEXT_PREVIEW_COLS);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThan(NEXT_PREVIEW_ROWS);
      }
    }
  });
});

describe("renderNextPiecePreview", () => {
  it("paints the preview background before drawing blocks", () => {
    const { ctx, fills } = createRecordingContext();
    const { width, height } = nextPreviewPixelSize();

    renderNextPiecePreview(ctx, "T");

    expect(fills[0]).toMatchObject({ x: 0, y: 0, w: width, h: height });
  });

  it("draws the centered spawn footprint using the preview fill style", () => {
    const { ctx, fills } = createRecordingContext();

    renderNextPiecePreview(ctx, "O");

    for (const { x, y } of nextPreviewCells("O")) {
      const block = previewCellFills(fills, x, y)[0];
      expect(block).toBeTruthy();
      expect(block!.style).toBe(NEXT_PREVIEW_FILL);
    }
  });

  it("uses a fill style distinct from the main playfield active piece", () => {
    const { ctx, fills } = createRecordingContext();
    renderNextPiecePreview(ctx, "J");

    const previewStyles = new Set(
      nextPreviewCells("J")
        .map(({ x, y }) => previewCellFills(fills, x, y)[0]?.style)
        .filter(Boolean),
    );
    expect(previewStyles.size).toBe(1);
    expect(previewStyles.has(NEXT_PREVIEW_FILL)).toBe(true);
    expect(NEXT_PREVIEW_FILL).not.toBe("#e6c84b");
  });
});

describe("next preview dev preview entry", () => {
  it("exposes a dedicated next-piece canvas in index.html", () => {
    const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
    expect(html).toMatch(/<canvas[^>]*\bid=["']next-preview["']/i);
  });

  it("draws the queued next kind from main.ts on the preview canvas", () => {
    const mainSource = readFileSync(new URL("../src/main.ts", import.meta.url), "utf8");
    expect(mainSource).toMatch(/getElementById\s*\(\s*["']next-preview["']\s*\)/);
    expect(mainSource).toMatch(/renderNextPiecePreview\s*\(/);
    expect(mainSource).toMatch(/nextPiece/);
  });
});
