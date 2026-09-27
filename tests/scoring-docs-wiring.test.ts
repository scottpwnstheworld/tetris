import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("scoring rules HUD wiring", () => {
  it("exposes a scoring-rules element in index.html", () => {
    const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
    expect(html).toMatch(/id=["']scoring-rules["']/);
  });

  it("binds scoring rules copy from play-hints in main.ts", () => {
    const mainSource = readFileSync(new URL("../src/main.ts", import.meta.url), "utf8");
    expect(mainSource).toMatch(/from\s+["']\.\/play-hints\.js["']/);
    expect(mainSource).toMatch(/formatScoringRulesSummary\s*\(/);
    expect(mainSource).toMatch(/getElementById\s*\(\s*["']scoring-rules["']\s*\)/);
  });
});
