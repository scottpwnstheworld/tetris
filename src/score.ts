const LINE_CLEAR_POINTS: Record<number, number> = {
  0: 0,
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

function effectiveLineClearLevel(level?: number): number {
  if (level === undefined || level <= 0) {
    return 1;
  }
  return level;
}

export function pointsForLineClear(lines: number, level?: number): number {
  const base = LINE_CLEAR_POINTS[lines] ?? 0;
  return base * effectiveLineClearLevel(level);
}

export function addLineClearScore(
  currentScore: number,
  linesCleared: number,
  level?: number,
): number {
  return currentScore + pointsForLineClear(linesCleared, level);
}

export function pointsForSoftDropCells(cells: number): number {
  if (cells <= 0) {
    return 0;
  }
  return cells;
}

export function addSoftDropScore(currentScore: number, cells: number): number {
  return currentScore + pointsForSoftDropCells(cells);
}

export function pointsForHardDropCells(cells: number): number {
  if (cells <= 0) {
    return 0;
  }
  return cells * 2;
}

export function addHardDropScore(currentScore: number, cells: number): number {
  return currentScore + pointsForHardDropCells(cells);
}
