import {
  PLAYFIELD_COLS,
  PLAYFIELD_ROWS,
  type Cell,
  type Playfield,
} from "./playfield.js";

export type ClearFullLinesResult = {
  grid: Playfield;
  linesCleared: number;
};

function emptyRow(): Cell[] {
  return Array.from({ length: PLAYFIELD_COLS }, (): Cell => null);
}

function isFullRow(row: Playfield[number]): boolean {
  return row.every((cell) => cell === "locked");
}

export function clearFullLines(grid: Playfield): ClearFullLinesResult {
  const keptRows: Playfield[number][] = [];
  let linesCleared = 0;

  for (const row of grid) {
    if (isFullRow(row)) {
      linesCleared++;
    } else {
      keptRows.push(row);
    }
  }

  if (linesCleared === 0) {
    return { grid, linesCleared: 0 };
  }

  const newGrid: Playfield = [
    ...Array.from({ length: linesCleared }, emptyRow),
    ...keptRows.map((row) => row.slice()),
  ];

  return { grid: newGrid, linesCleared };
}
