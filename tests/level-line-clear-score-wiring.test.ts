import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("level-scaled line-clear score wiring", () => {
  it("exports level-aware line-clear helpers from score.ts", () => {
    const scoreSource = readFileSync(new URL("../src/score.ts", import.meta.url), "utf8");
    expect(scoreSource).toMatch(/function\s+pointsForLineClear/);
    expect(scoreSource).toMatch(/level/);
    expect(scoreSource).toMatch(/function\s+addLineClearScore/);
  });

  it("derives scoring level from session totalLinesCleared before awarding clears", () => {
    const sessionSource = readFileSync(new URL("../src/session.ts", import.meta.url), "utf8");
    expect(sessionSource).toMatch(/from\s+["']\.\/gravity-speed\.js["']/);
    expect(sessionSource).toMatch(/levelFromTotalLines\s*\(/);
    expect(sessionSource).toMatch(/scoreAfterLineClear/);
    expect(sessionSource).toMatch(/totalLinesCleared/);
  });
});
