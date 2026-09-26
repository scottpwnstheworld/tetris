import {
  createPlaySession,
  handlePlayKey,
  stepPlayGravity,
  type PlaySession,
} from "./session.js";
import { renderGameState, resizePlayfieldCanvas } from "./render.js";

const canvas = document.getElementById("playfield");
const status = document.getElementById("status");
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("Missing #playfield canvas");
}
if (!(status instanceof HTMLParagraphElement)) {
  throw new Error("Missing #status");
}

resizePlayfieldCanvas(canvas);
const ctx = canvas.getContext("2d");
if (ctx === null) {
  throw new Error("Could not get 2d context");
}

let session: PlaySession = createPlaySession();
let lastLinesCleared = 0;

function updateStatus(): void {
  if (session.gameOver) {
    status.textContent = "Game over — refresh to play again.";
    return;
  }
  if (lastLinesCleared > 0) {
    status.textContent = `Cleared ${lastLinesCleared} line(s). Arrow keys: move / rotate clockwise.`;
    return;
  }
  status.textContent = "Arrow keys: left/right/down move, up rotates clockwise.";
}

function draw(): void {
  renderGameState(ctx, session.state);
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
