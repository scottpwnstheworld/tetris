import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("rotation rewrite wiring", () => {
  it("implements tryRotate through rotation-system instead of inline kick tables", () => {
    const rotationSource = readFileSync(new URL("../src/rotation.ts", import.meta.url), "utf8");
    expect(rotationSource).toMatch(/from\s+["']\.\/rotation-system\.js["']/);
    expect(rotationSource).toMatch(/attemptRotate\s*\(/);
    expect(rotationSource).not.toMatch(/WALL_KICKS/);
  });

  it("derives piece footprints from rotation-system rather than embedded SHAPES tables", () => {
    const pieceSource = readFileSync(new URL("../src/piece.ts", import.meta.url), "utf8");
    expect(pieceSource).toMatch(/from\s+["']\.\/rotation-system\.js["']/);
    expect(pieceSource).toMatch(/getLocalOffsets\s*\(/);
    expect(pieceSource).not.toMatch(/const\s+SHAPES\s*:/);
  });
});
