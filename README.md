# Tetris

Browser Tetris built in TypeScript with a canvas playfield. Play locally or via Remote Work on the dev machine.

## Setup

```bash
npm install
```

## Run the game

Start the Vite dev server:

```bash
npm run dev
```

Open [http://localhost:8795/](http://localhost:8795/) in a browser, or use the Remote Work / supervisor preview at [http://themainframe:8795/](http://themainframe:8795/) when the dev PC is reachable on Tailscale or LAN.

## Tests

```bash
npm test
```

## Controls

- **Keyboard:** Arrow keys — left/right/down move the piece; up rotates counter-clockwise. **C** swaps with the hold slot (once per lock). **Escape** pauses and resumes the game.
- **Touch / on-screen:** Use the **Left**, **Right**, and **Down** buttons to move the piece, plus hold, rotate, hard drop, and **Pause** below the playfield (`move-left`, `move-right`, `move-down`). After game over, tap **Restart** or press **Enter** to start a new game.
