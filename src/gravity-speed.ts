export const BASE_GRAVITY_INTERVAL_MS = 800;
export const MIN_GRAVITY_INTERVAL_MS = 100;

const GRAVITY_STEP_MS = 80;

export function levelFromTotalLines(totalLines: number): number {
  return Math.floor(totalLines / 10) + 1;
}

export function gravityIntervalMs(totalLines: number): number {
  const level = levelFromTotalLines(totalLines);
  const interval = BASE_GRAVITY_INTERVAL_MS - (level - 1) * GRAVITY_STEP_MS;
  return Math.max(MIN_GRAVITY_INTERVAL_MS, interval);
}
