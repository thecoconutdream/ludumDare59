# Space Pizza Delivery

> You are a hyper-intelligent space pizza delivery cat or dog. Pick up orders, dodge asteroids, and decrypt Wordle-style passwords to reach your wealthy alien clients. Fail the puzzle and their defense turrets will chase you out.

A browser-based pixel art game built for **Ludum Dare 59**.

---

## Play

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## How to Play

1. **Choose your breed** — nami (cat) or yumi (dog)
2. **Pick up the order** at Cosmic Pizza Co.
3. **Fly through space** — use arrow keys or WASD to thrust, dodge asteroids along the way
4. **Follow the compass** in the top-right corner to find your delivery target
5. **Explore side planets** (press `E` when nearby) for ship upgrades and outfit pieces
6. **Approach the client planet** and decrypt the password — Wordle style, 6 attempts
7. **Deliver successfully** → earn a new outfit piece and get the next order
8. **Fail the puzzle** → turrets activate, 10 seconds to escape or it's game over

---

## Controls

| Key | Action |
|---|---|
| `Arrow keys` / `WASD` | Thrust |
| `Enter` / `Space` | Confirm / Approach planet |
| `E` | Land on side planet |
| `Escape` | Skip intro |
| `A–Z` / `Backspace` / `Enter` | Wordle input |

---

## Tech Stack

- **TypeScript** — no framework, custom engine
- **Canvas 2D** — pixel art rendering at 320×180, upscaled to fill browser
- **Vite** — bundler & dev server
- **Howler.js** — audio (Phase 5)
- **pnpm** — package manager

---

## Project Structure

```
src/
  engine/       # Custom engine — GameLoop, SceneManager, Renderer, Camera,
                #   Input, Audio, AssetLoader, SpriteSheet, AnimationPlayer,
                #   Vector2, AABB
  game/
    scenes/     # MainMenu, CharacterSelect, Intro, SpaceFlight,
                #   SidePlanet, Wordle, Escape, Success, GameOver
    data/       # GameState, assetManifest, wordList (TODO)
public/
  assets/       # Sprites and audio go here (see assets.md)
```

---

## Asset Pipeline

All ~82 game assets are defined in `src/game/data/assetManifest.ts`.  
Until real sprites are ready, the engine generates color-coded placeholder canvases automatically — no code changes needed when dropping in real PNGs.

**To add a real asset:** place the PNG at `public/assets/<path>` matching the `path` field in the manifest. Done.

See [`assets.md`](assets.md) for full specs: pixel dimensions, sprite sheet layouts, frame-by-frame descriptions.

---

## Wordle — Contributor Handoff

The puzzle scene is fully wired up. To complete the word logic:

1. Create `src/game/data/wordList.ts` exporting a `string[]` of 5-letter uppercase words
2. In `src/game/scenes/WordleScene.ts`, replace the `ANSWER` constant with a random pick from the list

The `checkGuess()` function is already implemented and exported — extend it if needed.

---

## Roadmap

- [x] Engine foundation
- [x] Full scene flow (all 9 scenes)
- [ ] Pixel art assets
- [ ] Wordle word list
- [ ] Audio — SFX & music
- [ ] Sprite animations
- [ ] Polish & game feel
