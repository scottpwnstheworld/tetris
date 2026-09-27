import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("pause gameplay input wiring", () => {
  it("blocks hold and rotate-ccw in handlePlayAction while paused before dispatch", () => {
    const sessionSource = readFileSync(
      new URL("../src/session.ts", import.meta.url),
      "utf8",
    );

    expect(sessionSource).toMatch(/session\.paused/);
    expect(sessionSource).toMatch(/["']hold["']/);
    expect(sessionSource).toMatch(/["']rotate-ccw["']/);

    const actionFn = sessionSource.match(
      /export function handlePlayAction[\s\S]*?^}/m,
    );
    expect(actionFn).not.toBeNull();
    const pausedGuard = actionFn![0].match(
      /if\s*\(\s*session\.paused[\s\S]*?\)\s*\{\s*return session;\s*\}/,
    );
    expect(pausedGuard).not.toBeNull();
    const guardBody = pausedGuard![0];
    expect(guardBody).toMatch(/hold/);
    expect(guardBody).toMatch(/rotate-ccw/);
    expect(guardBody).toMatch(/rotate-cw/);
    expect(guardBody).toMatch(/hard-drop/);
    expect(guardBody).toMatch(/move-left/);
  });
});
