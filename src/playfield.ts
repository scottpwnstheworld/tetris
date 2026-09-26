export const PLAYFIELD_COLS = 10;
export const PLAYFIELD_ROWS = 20;

export type Cell = null | "locked";
export type Playfield = Cell[][];

export function createEmptyPlayfield(): Playfield {
  return Array.from({ length: PLAYFIELD_ROWS }, () =>
    Array.from({ length: PLAYFIELD_COLS }, (): Cell => null),
  );
}

export function isInsidePlayfield(x: number, y: number): boolean {
  return x >= 0 && x < PLAYFIELD_COLS && y >= 0 && y < PLAYFIELD_ROWS;
}
