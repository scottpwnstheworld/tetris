import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { bindPlayActionControls } from "../src/play-controls.js";

type PlayActionButton = {
  dataset: { playAction?: string };
  addEventListener(
    type: string,
    listener: (event: { type: string; preventDefault: () => void }) => void,
  ): void;
  listeners: Map<string, Array<(event: { type: string; preventDefault: () => void }) => void>>;
};

function createPlayActionButton(action: string): PlayActionButton {
  const listeners = new Map<
    string,
    Array<(event: { type: string; preventDefault: () => void }) => void>
  >();
  return {
    dataset: { playAction: action },
    listeners,
    addEventListener(type, listener) {
      const bucket = listeners.get(type) ?? [];
      bucket.push(listener);
      listeners.set(type, bucket);
    },
  };
}

function fireSequence(
  button: PlayActionButton,
  ...types: string[]
): void {
  for (const type of types) {
    const handlers = button.listeners.get(type) ?? [];
    for (const handler of handlers) {
      handler({ type, preventDefault: () => {} });
    }
  }
}

function createControlsRoot(buttons: PlayActionButton[]): ParentNode {
  return {
    querySelectorAll: () => buttons,
  } as ParentNode;
}

describe("bindPlayActionControls", () => {
  it("invokes onAction once when pointerdown is followed by click (touch double event)", () => {
    const button = createPlayActionButton("hard-drop");
    const root = createControlsRoot([button]);
    const actions: string[] = [];

    bindPlayActionControls(root, (action) => {
      actions.push(action);
    });

    fireSequence(button, "pointerdown", "click");

    expect(actions).toEqual(["hard-drop"]);
  });

  it("invokes onAction once per separate pointerdown taps", () => {
    const button = createPlayActionButton("rotate-ccw");
    const root = createControlsRoot([button]);
    const actions: string[] = [];

    bindPlayActionControls(root, (action) => {
      actions.push(action);
    });

    fireSequence(button, "pointerdown");
    fireSequence(button, "pointerdown");

    expect(actions).toEqual(["rotate-ccw", "rotate-ccw"]);
  });

  it("binds every data-play-action control under the root", () => {
    const rotate = createPlayActionButton("rotate-ccw");
    const drop = createPlayActionButton("hard-drop");
    const root = createControlsRoot([rotate, drop]);
    const actions: string[] = [];

    bindPlayActionControls(root, (action) => {
      actions.push(action);
    });

    fireSequence(rotate, "pointerdown", "click");
    fireSequence(drop, "pointerdown", "click");

    expect(actions).toEqual(["rotate-ccw", "hard-drop"]);
  });
});

describe("touch single-fire wiring", () => {
  it("delegates mobile control binding to play-controls from main.ts", () => {
    const mainSource = readFileSync(new URL("../src/main.ts", import.meta.url), "utf8");
    expect(mainSource).toMatch(/from\s+["']\.\/play-controls\.js["']/);
    expect(mainSource).toMatch(/bindPlayActionControls\s*\(/);
    expect(mainSource).not.toMatch(
      /addEventListener\s*\(\s*["']click["']\s*,\s*\(\)\s*=>\s*\{\s*\n\s*applyPlayAction/,
    );
    expect(mainSource).not.toMatch(
      /addEventListener\s*\(\s*["']pointerdown["']/,
    );
  });

  it("registers only one play-action listener type in play-controls.ts", () => {
    const source = readFileSync(
      new URL("../src/play-controls.ts", import.meta.url),
      "utf8",
    );
    const clickListeners = source.match(/addEventListener\s*\(\s*["']click["']/g) ?? [];
    const pointerListeners =
      source.match(/addEventListener\s*\(\s*["']pointerdown["']/g) ?? [];
    expect(clickListeners.length + pointerListeners.length).toBe(1);
  });
});
