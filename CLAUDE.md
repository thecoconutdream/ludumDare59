# Space Pizza Delivery — Claude Context

Ludum Dare 59 game project. Browser game, TypeScript, no framework, custom engine.

## Dev Server

```bash
pnpm dev        # starts Vite on http://localhost:5173
pnpm exec tsc --noEmit  # type-check without building
```

No Docker, no Justfile — plain pnpm + Vite.

## Stack

- **Language**: TypeScript (strict mode, `noImplicitReturns`)
- **Bundler**: Vite 5
- **Audio**: Howler.js
- **Package manager**: pnpm
- **Target resolution**: 320×180px upscaled to fill browser (pixel art, `imageRendering: pixelated`)
- **No game framework** — custom engine in `src/engine/`

## Path Aliases

```ts
@engine/*  →  src/engine/*
@game/*    →  src/game/*
```

## Project Structure

```
src/
  engine/           # Pure engine — no game logic allowed here
    core/           # GameLoop, SceneManager, EventBus
    rendering/      # Renderer, Camera, SpriteSheet, AnimationPlayer
    input/          # InputManager
    audio/          # AudioManager
    assets/         # AssetLoader (with placeholder fallback system)
    physics/        # Vector2, AABB
  game/
    scenes/         # One file per scene
    data/           # assetManifest.ts, wordList.ts, characters.ts, etc.
    entities/       # Player, Spaceship, Asteroid, etc. (Phase 2+)
    systems/        # AsteroidSystem, CompassSystem, etc. (Phase 2+)
  main.ts           # Boot: loads manifest → pushes MainMenuScene → starts GameLoop
public/
  assets/
    sprites/        # All PNG assets go here, mirroring paths in assetManifest.ts
    audio/          # Sound files
```

## Engine — Key Concepts

### GameLoop (`src/engine/core/GameLoop.ts`)
Fixed timestep at 60fps. Calls `scenes.update(FIXED_TIMESTEP)` in a fixed loop, then `scenes.render(ctx)` once per frame. Calls `input.flush()` after render.

### SceneManager (`src/engine/core/SceneManager.ts`)
Push/pop stack. A `Scene` must implement `onEnter()`, `onExit()`, `update(dt)`, `render(ctx)`.
- `scenes.push(scene)` — overlay (current scene exits)
- `scenes.replace(scene)` — swap (no back-navigation)
- `scenes.pop()` — go back

### InputManager (`src/engine/input/InputManager.ts`)
Action-based. Actions defined in `main.ts`:
- `up / down / left / right` → Arrow keys + WASD
- `confirm` → Enter / Space
- `cancel` → Escape
- `land` → E

Use `input.isPressed('confirm')` for one-shot, `input.isHeld('up')` for continuous.

### AssetLoader (`src/engine/assets/AssetLoader.ts`)
Two modes:
1. `loadManifest(assetManifest)` — loads all assets defined in manifest, generates colored placeholder canvases for missing files
2. `loadImage(key, src)` — manual single-image load

Always access via `assets.getImage('key')`. Never load images ad-hoc in scenes.

**Placeholder system**: If a PNG is missing at `/assets/<path>`, a colored canvas is generated automatically. Sprite sheets show frame grid lines. Drop a real PNG at the right path → it loads automatically on next boot. No code change needed.

### Asset Manifest (`src/game/data/assetManifest.ts`)
Single source of truth for all ~82 game assets. Each entry has: `key`, `path`, `width`, `height`, optional `frameWidth`/`frameHeight`, `placeholderColor`, `label`.
See `assets.md` for full asset spec with pixel dimensions and sprite sheet layouts.

### SpriteSheet + AnimationPlayer
```ts
const sheet = new SpriteSheet(assets.getImage('ship'), 32, 24)
const anim = new AnimationPlayer()
anim.play({ frames: [0, 1, 2, 3], fps: 12, loop: true })
// in update:
anim.update(dt)
// in render:
sheet.drawFrame(ctx, anim.currentFrame, x, y)
```

### Camera (`src/engine/rendering/Camera.ts`)
World-space ↔ screen-space transform. Use `camera.worldToScreen(pos)` before drawing. `camera.follow(target, 0.1)` for smooth tracking (call in update).

### EventBus (`src/engine/core/EventBus.ts`)
Global singleton `events` for decoupled communication between systems.
```ts
import { events } from '@engine/core/EventBus'
events.emit('playerHit', { damage: 1 })
events.on('playerHit', (data) => { ... })
```

## Game — Scene Flow

```
MainMenu → CharacterSelect → IntroScene → SpaceFlightScene
  SpaceFlightScene:
    [approach side planet]  → SidePlanetScene → back to SpaceFlightScene
    [reach client planet]   → WordleScene
      WordleScene solved    → SuccessScene → SpaceFlightScene (next order)
      WordleScene failed    → EscapeScene
        EscapeScene escaped → SpaceFlightScene (new address)
        EscapeScene hit     → GameOverScene → MainMenu
    [asteroid hit]          → GameOverScene
```

## Game — Planet Types

| Type | Key prefix | Size | Has building |
|---|---|---|---|
| Home (pizzeria) | `planet_home` | 48×48 | yes — pizzeria |
| Client (delivery target) | `planet_client_1/2/3` | 48×48 | yes — mansion |
| Client armed (escape) | `planet_client_1/2/3_armed` | 48×48 | yes + turrets |
| Side (optional loot) | `planet_side_<biome>_1/2` | 40×40 | no |
| Dead (decoration) | `planet_dead_1/2/3` | 32×32 | no |

Side planet biomes: `ice`, `jungle`, `desert`, `lava`

## Game — Ship Upgrades

Found on side planets. Stored in player state.

| Key | Effect | Duration |
|---|---|---|
| `hyperdrive` | +40% top speed | Until next delivery |
| `thruster_damage` | −30% top speed | Until back at pizzeria |
| `shield` | Absorbs one asteroid hit | One use |
| `nav_chip` | Compass shows ETA | Permanent |

## Implementation Phases

- [x] Phase 1 — Engine foundation (GameLoop, SceneManager, Renderer, Input, Assets, Physics)
- [x] Phase 2 — Full scene flow (all 9 scenes wired up, SpaceFlightScene with ship physics + asteroids + planets + compass)
- [ ] Phase 3 — Real assets (replace placeholder canvases with actual sprite PNGs)
- [ ] Phase 4 — Wordle real word list + proper validation (see WordleScene.ts TODO)
- [ ] Phase 5 — Audio (Howler integration, SFX, music)
- [ ] Phase 6 — Polish (sprite animations, screenshake tuning, particles)

## Wordle — Handoff for Colleague

File: `src/game/scenes/WordleScene.ts`

- `ANSWER` constant at top → replace with `wordList[Math.floor(Math.random() * wordList.length)]`
- `checkGuess(guess, answer)` is exported and correct — extend if needed for edge cases
- Create `src/game/data/wordList.ts` exporting a `string[]` of 5-letter uppercase words
- The scene handles all UI, keyboard input, win/fail transitions — no changes needed outside the two TODOs

## Conventions

- Scenes get `scenes`, `input`, `assets` passed in constructor — no globals except `events`
- Entities are plain classes with `update(dt)` and `render(ctx, camera)` methods
- All pixel coordinates are in **game space** (320×180); camera handles world→screen transform
- Asset keys are always referenced from `assetManifest.ts` — never hardcode paths in scene code
- No comments unless the WHY is non-obvious
