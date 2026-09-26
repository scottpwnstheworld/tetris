import {
  createPlaySession,
  handlePlayAction,
  handlePlayKey,
  stepPlayGravity,
  type PlaySession,
} from "./session.js";
import {
  formatScoreText,
  renderGameState,
  renderNextPiecePreview,
  resizeNextPreviewCanvas,
  resizePlayfieldCanvas,
} from "./render.js";

const canvas = document.getElementById("playfield");
const nextPreviewCanvas = document.getElementById("next-preview");
const status = document.getElementById("status");
const scoreEl = document.getElementById("score");
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("Missing #playfield canvas");
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

resizePlayfieldCanvas(canvas);
resizeNextPreviewCanvas(nextPreviewCanvas);
const ctx = canvas.getContext("2d");
if (ctx === null) {
  throw new Error("Could not get 2d context");
}
const nextPreviewCtx = nextPreviewCanvas.getContext("2d");
if (nextPreviewCtx === null) {
  throw new Error("Could not get next preview 2d context");
}

let session: PlaySession = createPlaySession();
let lastLinesCleared = 0;

function updateStatus(): void {
  if (session.gameOver) {
    status.textContent = "Game over — refresh to play again.";
    return;
  }
  if (lastLinesCleared > 0) {
    status.textContent = `Cleared ${lastLinesCleared} line(s). Arrow keys: move / rotate counter-clockwise.`;
    return;
  }
  status.textContent = "Arrow keys: left/right/down move, up rotates counter-clockwise.";
}

function draw(): void {
  renderGameState(ctx, session.state);
  renderNextPiecePreview(nextPreviewCtx, session.state.nextPiece);
  scoreEl.textContent = formatScoreText(session.score);
  updateStatus();
}

draw();

const GRAVITY_MS = 800;
window.setInterval(() => {
  if (session.gameOver) {
    return;
  }
  const result = stepPlayGravity(session);
  lastLinesCleared = result.linesCleared;
  session = {
    state: result.state,
    gameOver: result.gameOver,
    score: result.score,
  };
  draw();
}, GRAVITY_MS);

window.addEventListener("keydown", (event) => {
  if (!event.key.startsWith("Arrow")) {
    return;
  }
  event.preventDefault();
  lastLinesCleared = 0;
  session = handlePlayKey(session, event.key);
  draw();
});

function applyPlayAction(action: string): void {
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
    };
  } else {
    session = result;
  }
  draw();
}

for (const control of document.querySelectorAll("[data-play-action]")) {
  if (!(control instanceof HTMLButtonElement)) {
    continue;
  }
  const action = control.dataset.playAction;
  if (!action) {
    continue;
  }
  control.addEventListener("click", () => {
    applyPlayAction(action);
  });
  control.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    applyPlayAction(action);
  });
}
