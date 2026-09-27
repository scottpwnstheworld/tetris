import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("soft-drop score wiring", () => {
  it("session imports soft-drop score helpers from score.ts", () => {
    const sessionSource = readFileSync(
      new URL("../src/session.ts", import.meta.url),
      "utf8",
    );
    expect(sessionSource).toMatch(/from\s+["']\.\/score\.js["']/);
    expect(sessionSource).toMatch(/addSoftDropScore/);
  });

  it("applies soft-drop scoring on ArrowDown in handlePlayKey", () => {
    const sessionSource = readFileSync(
      new URL("../src/session.ts", import.meta.url),
      "utf8",
    );
    expect(sessionSource).toMatch(/case\s+["']ArrowDown["']/);
    expect(sessionSource).toMatch(/addSoftDropScore/);
  });
});
