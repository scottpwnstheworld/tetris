import {
  createPlaySession,
  handlePlayAction,
  handlePlayKey,
  restartPlaySession,
  stepPlayGravity,
  type PlaySession,
} from "./session.js";
import { gravityIntervalMs, levelFromTotalLines } from "./gravity-speed.js";
import {
  formatLevelText,
  formatScoreText,
  renderGameState,
  renderHoldPiecePreview,
  renderNextPiecePreview,
  resizeHoldPreviewCanvas,
  resizeNextPreviewCanvas,
  resizePlayfieldCanvas,
} from "./render.js";
import { bindPlayActionControls } from "./play-controls.js";
import {
  formatGameOverStatus,
  formatIdlePlayStatus,
  formatLineClearStatus,
  formatPausedPlayStatus,
  formatScoringRulesSummary,
} from "./play-hints.js";

const canvas = document.getElementById("playfield");
const holdPreviewCanvas = document.getElementById("hold-preview");
const nextPreviewCanvas = document.getElementById("next-preview");
const status = document.getElementById("status");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const scoringRulesEl = document.getElementById("scoring-rules");
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("Missing #playfield canvas");
}
if (!(holdPreviewCanvas instanceof HTMLCanvasElement)) {
  throw new Error("Missing #hold-preview canvas");
}
if (!(nextPreviewCanvas instanceof HTMLCanvasElement)) {
  throw new Error("Missing #next-preview canvas");
}
if (!(status instanceof HTMLParagraphElement)) {
  throw new Error("Missing #status");
}
if (!(scoreEl instanceof HTMLParagraphElement)) {
  throw new Error("Missing #score");
}
if (!(levelEl instanceof HTMLParagraphElement)) {
  throw new Error("Missing #level");
}
if (!(scoringRulesEl instanceof HTMLParagraphElement)) {
  throw new Error("Missing #scoring-rules");
}

scoringRulesEl.textContent = formatScoringRulesSummary();

resizePlayfieldCanvas(canvas);
resizeHoldPreviewCanvas(holdPreviewCanvas);
resizeNextPreviewCanvas(nextPreviewCanvas);
const ctx = canvas.getContext("2d");
if (ctx === null) {
  throw new Error("Could not get 2d context");
}
const holdPreviewCtx = holdPreviewCanvas.getContext("2d");
if (holdPreviewCtx === null) {
  throw new Error("Could not get hold preview 2d context");
}
const nextPreviewCtx = nextPreviewCanvas.getContext("2d");
if (nextPreviewCtx === null) {
  throw new Error("Could not get next preview 2d context");
}

let session: PlaySession = createPlaySession();
let lastLinesCleared = 0;

function updateStatus(): void {
  if (session.gameOver) {
    status.textContent = formatGameOverStatus();
    return;
  }
  if (session.paused) {
    status.textContent = formatPausedPlayStatus();
    return;
  }
  if (lastLinesCleared > 0) {
    status.textContent = formatLineClearStatus(lastLinesCleared);
    return;
  }
  status.textContent = formatIdlePlayStatus();
}

function draw(): void {
  renderGameState(ctx, session.state);
  renderHoldPiecePreview(holdPreviewCtx, session.state.holdPiece ?? null);
  renderNextPiecePreview(nextPreviewCtx, session.state.nextPiece);
  scoreEl.textContent = formatScoreText(session.score);
  levelEl.textContent = formatLevelText(
    levelFromTotalLines(session.totalLinesCleared),
  );
  updateStatus();
}

let gravityTimer: ReturnType<typeof window.setInterval> | undefined;

function syncGravityInterval(): void {
  if (gravityTimer !== undefined) {
    window.clearInterval(gravityTimer);
  }
  const ms = gravityIntervalMs(session.totalLinesCleared);
  gravityTimer = window.setInterval(() => {
    if (session.gameOver || session.paused) {
      return;
    }
    const result = stepPlayGravity(session);
    lastLinesCleared = result.linesCleared;
    session = {
      state: result.state,
      gameOver: result.gameOver,
      score: result.score,
      totalLinesCleared: result.totalLinesCleared,
      paused: result.paused,
    };
    if (result.linesCleared > 0) {
      syncGravityInterval();
    }
    draw();
  }, ms);
}

draw();
syncGravityInterval();

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    session = handlePlayKey(session, "Escape");
    draw();
    return;
  }
  if (event.key === "Enter") {
    const next = restartPlaySession(session);
    if (next !== session) {
      lastLinesCleared = 0;
      session = next;
      syncGravityInterval();
      draw();
    }
    return;
  }
  if (event.code === "KeyC") {
    lastLinesCleared = 0;
    session = handlePlayKey(session, "KeyC");
    draw();
    return;
  }
  if (event.code === "KeyX") {
    lastLinesCleared = 0;
    session = handlePlayKey(session, "KeyX");
    draw();
    return;
  }
  if (!event.key.startsWith("Arrow")) {
    return;
  }
  event.preventDefault();
  lastLinesCleared = 0;
  session = handlePlayKey(session, event.key);
  draw();
});

function applyPlayAction(action: string): void {
  if (action === "restart") {
    const next = restartPlaySession(session);
    if (next !== session) {
      lastLinesCleared = 0;
      session = next;
      syncGravityInterval();
      draw();
    }
    return;
  }
  const result = handlePlayAction(session, action);
  if (result === session) {
    return;
  }
  if ("linesCleared" in result) {
    lastLinesCleared = result.linesCleared;
    session = {
      state: result.state,
      gameOver: result.gameOver,
      score: result.score,
      totalLinesCleared: result.totalLinesCleared,
      paused: result.paused,
    };
    if (result.linesCleared > 0) {
      syncGravityInterval();
    }
  } else {
    session = result;
  }
  draw();
}

bindPlayActionControls(document, applyPlayAction);
