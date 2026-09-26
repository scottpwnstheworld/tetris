import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("restart UI wiring", () => {
  it("exposes a touch-friendly restart control in index.html", () => {
    const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
    expect(html).toMatch(/data-play-action=["']restart["']/);
    expect(html).toMatch(/type=["']button["']/);
  });

  it("routes Enter and restart actions through restartPlaySession in main.ts", () => {
    const mainSource = readFileSync(new URL("../src/main.ts", import.meta.url), "utf8");
    expect(mainSource).toMatch(/restartPlaySession\s*\(/);
    expect(mainSource).toMatch(/Enter/);
    expect(mainSource).toMatch(/["']restart["']/);
  });

  it("implements restartPlaySession and handlePlayAction restart in session.ts", () => {
    const sessionSource = readFileSync(
      new URL("../src/session.ts", import.meta.url),
      "utf8",
    );
    expect(sessionSource).toMatch(/export function restartPlaySession\s*\(/);
    expect(sessionSource).toMatch(/case\s+["']restart["']/);
    expect(sessionSource).toMatch(/Enter/);
  });
});
