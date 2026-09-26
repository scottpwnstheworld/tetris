import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");

describe("README run documentation", () => {
  it("documents installing dependencies with npm install", () => {
    expect(readme).toMatch(/npm install/);
  });

  it("documents starting the Vite dev server with npm run dev", () => {
    expect(readme).toMatch(/npm run dev/);
  });

  it("documents running the Vitest suite with npm test", () => {
    expect(readme).toMatch(/npm test/);
  });

  it("documents the Remote Work / supervisor preview URL on port 8795", () => {
    expect(readme).toMatch(/8795/);
    expect(readme.toLowerCase()).toMatch(/themainframe|supervisor|remote work/);
  });

  it("describes keyboard and touch play controls in the repo", () => {
    const lower = readme.toLowerCase();
    expect(lower).toMatch(/arrow/);
    expect(lower).toMatch(/rotate/);
    expect(lower).toMatch(/drop/);
  });

  it("does not point readers only at external WYWG data for how to run the game", () => {
    expect(readme).not.toMatch(
      /Goals and progress live in `while_you_were_gone\/data\/repos\/tetris\/`, not in this repo\./,
    );
  });
});
