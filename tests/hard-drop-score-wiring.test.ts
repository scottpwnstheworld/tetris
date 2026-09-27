import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("hard-drop score wiring", () => {
  it("session imports hard-drop score helpers from score.ts", () => {
    const sessionSource = readFileSync(
      new URL("../src/session.ts", import.meta.url),
      "utf8",
    );
    expect(sessionSource).toMatch(/from\s+["']\.\/score\.js["']/);
    expect(sessionSource).toMatch(/addHardDropScore/);
  });

  it("applies hard-drop scoring in the hard-drop action branch", () => {
    const sessionSource = readFileSync(
      new URL("../src/session.ts", import.meta.url),
      "utf8",
    );
    expect(sessionSource).toMatch(/case\s+["']hard-drop["']/);
    const hardDropCase = sessionSource.slice(
      sessionSource.indexOf('case "hard-drop"'),
      sessionSource.indexOf("case", sessionSource.indexOf('case "hard-drop"') + 1),
    );
    expect(hardDropCase).toMatch(/addHardDropScore/);
    expect(hardDropCase).toMatch(/cellsDropped/);
  });

  it("hardDrop exposes cellsDropped on the gravity result", () => {
    const gameSource = readFileSync(
      new URL("../src/game.ts", import.meta.url),
      "utf8",
    );
    expect(gameSource).toMatch(/cellsDropped/);
  });
});
