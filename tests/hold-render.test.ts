import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  HOLD_PREVIEW_FILL,
  renderHoldPiecePreview,
  resizeHoldPreviewCanvas,
  nextPreviewPixelSize,
} from "../src/render.js";

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

describe("hold preview render", () => {
  it("exports a hold preview fill distinct from the next preview fill", () => {
    const renderSource = readFileSync(new URL("../src/render.ts", import.meta.url), "utf8");
    expect(renderSource).toMatch(/export const HOLD_PREVIEW_FILL/);
    expect(HOLD_PREVIEW_FILL).not.toBe("#e6c84b");
    expect(HOLD_PREVIEW_FILL).toMatch(/^#/);
  });

  it("resizes the hold canvas like the next preview dimensions", () => {
    const canvas = { width: 0, height: 0 };
    resizeHoldPreviewCanvas(canvas as HTMLCanvasElement);
    const size = nextPreviewPixelSize();
    expect(canvas.width).toBe(size.width);
    expect(canvas.height).toBe(size.height);
  });

  it("paints only the background when hold is empty", () => {
    const { ctx, fills } = createRecordingContext();
    renderHoldPiecePreview(ctx, null);
    const pieceFills = fills.filter((f) => f.style === HOLD_PREVIEW_FILL);
    expect(pieceFills).toHaveLength(0);
    expect(fills.length).toBeGreaterThan(0);
  });

  it("paints four hold cells for a stored kind", () => {
    const { ctx, fills } = createRecordingContext();
    renderHoldPiecePreview(ctx, "T");
    const pieceFills = fills.filter((f) => f.style === HOLD_PREVIEW_FILL);
    expect(pieceFills).toHaveLength(4);
  });
});

describe("hold preview HTML wiring", () => {
  it("exposes a hold preview canvas in index.html", () => {
    const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
    expect(html).toMatch(/id=["']hold-preview["']/);
    expect(html).toMatch(/data-play-action=["']hold["']/);
  });

  it("main.ts renders the hold preview from session state", () => {
    const mainSource = readFileSync(new URL("../src/main.ts", import.meta.url), "utf8");
    expect(mainSource).toMatch(/renderHoldPiecePreview\s*\(/);
    expect(mainSource).toMatch(/hold-preview/);
  });
});
