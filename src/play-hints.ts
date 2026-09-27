const IDLE_HINTS =
  "Arrow keys: left/right/down move, up rotates counter-clockwise. Press C or tap Hold to swap the hold piece (once per lock). On-screen buttons: hold, rotate, and hard drop (touch-friendly).";

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
