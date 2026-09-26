const LINE_CLEAR_POINTS: Record<number, number> = {
  0: 0,
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

export function pointsForLineClear(lines: number): number {
  return LINE_CLEAR_POINTS[lines] ?? 0;
}

export function addLineClearScore(currentScore: number, linesCleared: number): number {
  return currentScore + pointsForLineClear(linesCleared);
}
