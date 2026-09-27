import { describe, expect, it } from "vitest";
import {
  pointsForHardDropCells,
  pointsForLineClear,
  pointsForSoftDropCells,
} from "../src/score.js";
import { formatScoringRulesSummary } from "../src/play-hints.js";

describe("formatScoringRulesSummary", () => {
  it("returns a non-empty player-facing summary", () => {
    const text = formatScoringRulesSummary();
    expect(text.trim().length).toBeGreaterThan(40);
  });

  it("documents guideline base line-clear awards at level 1", () => {
    const text = formatScoringRulesSummary();
    expect(text).toMatch(/100/);
    expect(text).toMatch(/300/);
    expect(text).toMatch(/500/);
    expect(text).toMatch(/800/);
    expect(pointsForLineClear(1, 1)).toBe(100);
    expect(pointsForLineClear(4, 1)).toBe(800);
  });

  it("documents that line-clear points multiply by the active level", () => {
    const lower = formatScoringRulesSummary().toLowerCase();
    expect(lower).toMatch(/level/);
    expect(lower).toMatch(/multipl|×|\*|times|scale/);
    expect(formatScoringRulesSummary()).toMatch(
      String(pointsForLineClear(1, 2)),
    );
  });

  it("documents soft-drop cell scoring", () => {
    const lower = formatScoringRulesSummary().toLowerCase();
    expect(lower).toMatch(/soft/);
    expect(lower).toMatch(/down/);
    const perCell = pointsForSoftDropCells(4) / 4;
    expect(lower).toMatch(String(perCell));
  });

  it("documents hard-drop cell scoring", () => {
    const lower = formatScoringRulesSummary().toLowerCase();
    expect(lower).toMatch(/hard/);
    const perCell = pointsForHardDropCells(3) / 3;
    expect(lower).toMatch(String(perCell));
  });

  it("documents that level rises every ten total lines cleared", () => {
    const lower = formatScoringRulesSummary().toLowerCase();
    expect(lower).toMatch(/10/);
    expect(lower).toMatch(/line/);
    expect(lower).toMatch(/level/);
  });
});
