const IDLE_HINTS =
  "Arrow keys: left/right/down move, up rotates counter-clockwise. On-screen buttons: rotate and hard drop (touch-friendly).";

export function formatIdlePlayStatus(): string {
  return IDLE_HINTS;
}

export function formatLineClearStatus(linesCleared: number): string {
  return `Cleared ${linesCleared} line(s). ${IDLE_HINTS}`;
}

export function formatGameOverStatus(): string {
  return "Game over — refresh to play again.";
}
