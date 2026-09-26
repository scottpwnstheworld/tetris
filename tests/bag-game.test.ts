import { describe, expect, it } from "vitest";
import { createEmptyPlayfield } from "../src/playfield.js";
import { spawnPiece } from "../src/piece.js";
import { createBagState, takeFromBag } from "../src/bag.js";
import { createGameState, hardDrop, tickGravity, type GameState } from "../src/game.js";

function nextTwoKinds(seed: number) {
  const first = takeFromBag(createBagState(seed));
  const second = takeFromBag(first.bag);
  return { active: first.kind, next: second.kind, bag: second.bag };
}

describe("GameState bag field", () => {
  it("createGameState carries an explicit bag for queue advancement", () => {
    const queue = createBagState(0);
    const state = createGameState("T", "O", queue);

    expect(state.bag).toEqual(queue);
    expect(state.nextPiece).toBe("O");
    expect(state.piece).toEqual(spawnPiece("T"));
  });
});

describe("tickGravity with seven-bag queue", () => {
  it("advances nextPiece from the bag after a lock", () => {
    const seed = 5;
    const start = nextTwoKinds(seed);
    const third = takeFromBag(start.bag);

    const onFloor = { ...spawnPiece(start.active), x: 3, y: 18 };
    const before: GameState = {
      grid: createEmptyPlayfield(),
      piece: onFloor,
      nextPiece: start.next,
      bag: start.bag,
    };

    const { state, gameOver, linesCleared } = tickGravity(before);

    expect(gameOver).toBe(false);
    expect(linesCleared).toBe(0);
    expect(state.piece).toEqual(spawnPiece(start.next));
    expect(state.nextPiece).toBe(third.kind);
    expect(state.bag).toEqual(third.bag);
  });

  it("leaves the bag unchanged when the piece only moves down", () => {
    const start = nextTwoKinds(2);
    const before = createGameState(start.active, start.next, start.bag);
    const { state } = tickGravity(before);

    expect(state.bag).toEqual(start.bag);
    expect(state.nextPiece).toBe(start.next);
  });
});

describe("hardDrop with seven-bag queue", () => {
  it("spawns the queued kind and draws the following kind from the bag", () => {
    const start = nextTwoKinds(8);
    const third = takeFromBag(start.bag);
    const before = createGameState(start.active, start.next, start.bag);

    const result = hardDrop(before);

    expect(result.gameOver).toBe(false);
    expect(result.state.piece).toEqual(spawnPiece(start.next));
    expect(result.state.nextPiece).toBe(third.kind);
    expect(result.state.bag).toEqual(third.bag);
  });
});
