const IDLE_HINTS =
  "Arrow keys: left/right/down move, up rotates counter-clockwise, X rotates clockwise. Press C or tap Hold to swap the hold piece (once per lock). On-screen buttons: left, right, down, hold, rotate ↺/↻, and hard drop (touch-friendly).";

export function formatIdlePlayStatus(): string {
  return IDLE_HINTS;
}

export function formatLineClearStatus(linesCleared: number): string {
  return `Cleared ${linesCleared} line(s). ${IDLE_HINTS}`;
}

export function formatGameOverStatus(): string {
  return "Game over — press Enter or tap Restart to play again.";
}

export function formatPausedPlayStatus(): string {
  return "Paused — press Escape or tap Pause to resume.";
}

export function formatScoringRulesSummary(): string {
  return (
    "Scoring: line clears use guideline base awards (100 / 300 / 500 / 800 for 1–4 lines) " +
    "multiplied by your active level (e.g. one line at level 2 = 200 points). " +
    "Soft-drop (Arrow Down or Down button) earns 1 point per cell moved down; " +
    "hard drop earns 2 points per cell. Level increases every 10 total lines cleared."
  );
}
