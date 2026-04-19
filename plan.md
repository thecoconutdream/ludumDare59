# Space Pizza Delivery — Game Plan

## Concept

You are a space pizza delivery driver — either a hyper-intelligent cat or dog breed. Pick up orders at the **pizzeria on your home planet**, fly through asteroid fields, optionally explore **side planets** for loot, land at **wealthy client planets** (recognizable by the mansion/building on the surface), decrypt a password via Wordle to prove your intellect, deliver the pizza, collect outfit rewards. Get hit by weapons = game over.

---

## Technical Stack

| Layer | Choice | Reason |
|---|---|---|
| Language | TypeScript | Type safety, IDE support |
| Renderer | Canvas 2D (native) | No overhead, pixel-perfect control |
| Bundler | Vite | Fast HMR, TS out of the box |
| Audio | Howler.js | Simple browser audio API |
| Package manager | pnpm | Fast, lockfile stable |
| Target resolution | 320×180 → upscaled | Classic pixel art aspect ratio |

No game framework — we build a minimal engine. Keeps the codebase transparent and educational.

---

## Engine Architecture

### Core Loop
```
main.ts → GameLoop (requestAnimationFrame)
            ├── SceneManager.update(dt)
            ├── SceneManager.render(ctx)
            └── InputManager.flush()
```

### Engine Modules

```
src/engine/
  core/
    GameLoop.ts          # Fixed-timestep update, variable render
    SceneManager.ts      # Push/pop scene stack
    EventBus.ts          # Decoupled pub/sub between systems
  rendering/
    Renderer.ts          # Canvas context wrapper, clear/scale
    Camera.ts            # World-to-screen transform
    SpriteSheet.ts       # Slice sprite PNG into frames
    AnimationPlayer.ts   # Frame sequence + timing
  input/
    InputManager.ts      # Keyboard, pointer; action mapping
  audio/
    AudioManager.ts      # Wrap Howler, named sound playback
  assets/
    AssetLoader.ts       # Preload images/audio, progress callback
  physics/
    Vector2.ts           # 2D math util
    AABB.ts              # Axis-aligned bounding box collision
```

---

## Game Scenes

```
src/game/scenes/
  MainMenuScene.ts         # Title, start, credits
  CharacterSelectScene.ts  # Cat breed vs Dog breed choice
  IntroScene.ts            # Scripted: pizzeria interior → order pickup → walk to rocket → launch
  SpaceFlightScene.ts      # Core flight gameplay
  SidePlanetScene.ts       # Optional landing: explore for loot (outfit / ship upgrade / empty)
  WordleScene.ts           # Password puzzle overlay at client planet
  EscapeScene.ts           # Countdown + weapon fire, fly-away mechanic
  SuccessScene.ts          # Delivery confirmed + outfit unlock animation
  GameOverScene.ts         # Hit by weapon → retry from pizzeria
```

---

## Game Entities & Systems

```
src/game/
  entities/
    Player.ts           # Sprite, stats, current outfit
    Spaceship.ts        # Thruster physics, hitbox, active upgrades
    Asteroid.ts         # Random shape, velocity, rotation
    SpaceJunk.ts        # Debris variants
    WeaponTurret.ts     # Aim logic, projectile spawn
    Projectile.ts       # Moves toward player, collision check
    Planet.ts           # Base planet entity: type, biome sprite, loot table, interaction zone
    PizzeriaBuilding.ts # Intro scene: shop exterior + interior (counter, oven, boxes)
    ClientMansion.ts    # Client planet: mansion/villa building on surface

  systems/
    AsteroidSystem.ts   # Spawn, pool, wrap/despawn
    CompassSystem.ts    # Direction arrow to target planet
    WordleSystem.ts     # Word validation, color feedback (🟩🟨⬛)
    WeaponSystem.ts     # Turret activation, countdown, fire
    OutfitSystem.ts     # Unlock tracking, apply to player sprite
    PlanetSystem.ts     # Manage all planets in flight scene: types, proximity detection, loot roll
    UpgradeSystem.ts    # Ship upgrades: speed buff/debuff, duration, stacking rules

  data/
    wordList.ts         # Curated 5-letter word pool (EN or DE)
    characters.ts       # Cat/dog breed definitions + base sprites
    outfits.ts          # Outfit item definitions + unlock order
    planets.ts          # Planet type definitions, biome sprites, loot tables
    upgrades.ts         # Ship upgrade definitions (speed+, speed-, etc.)
```

---

## Scene Flow

```
MainMenu
  └─► CharacterSelect
        └─► IntroScene  (scripted: pizzeria interior → order pickup → walk to rocket → launch)
              └─► SpaceFlightScene
                    ├─ [approach side planet] ──► SidePlanetScene
                    │                               ├─ [loot: outfit]   → add to inventory, back to flight
                    │                               ├─ [loot: upgrade]  → apply to ship, back to flight
                    │                               └─ [empty]          → nothing, back to flight
                    ├─ [reach client planet]  ──► WordleScene
                    │                               ├─ [solved]  ──► SuccessScene ──► SpaceFlightScene (next order)
                    │                               └─ [failed]  ──► EscapeScene
                    │                                               ├─ [escaped] ──► SpaceFlightScene (new address)
                    │                                               └─ [hit]     ──► GameOverScene ──► MainMenu
                    └─ [hit by asteroid]      ──► GameOverScene
```

---

## IntroScene — Details

- **Pizzeria interior**: Counter, oven in background, pizza boxes stacked — establishes the world
- **Order pickup**: NPC (boss character) slides order across counter, player picks it up
- **Exterior walk**: Player walks out to rocket on launchpad
- **Launch**: Rocket ignites, flies up → transition to SpaceFlightScene
- All scripted (no player input needed, or a single "press to continue" gate)

---

## SpaceFlightScene — Details

- **Player movement**: 8-directional thrust, momentum/drag (space feel)
- **Asteroids**: Procedurally spawned ahead of flight path, pooled
- **Parallax background**: 2–3 star layers scrolling at different speeds
- **Compass HUD**: Always-visible arrow pointing to client planet
- **Distance indicator**: Shows remaining distance to destination
- **Planets along the route**: Decorative + interactive; appear as you fly (see Planet Types below)
- **Minimap** *(optional, phase 2)*: Small radar in corner

### Planet Types in SpaceFlightScene

| Type | Visual | Interaction | Loot |
|---|---|---|---|
| **Home planet** | Pizzeria visible on surface | Start only | — |
| **Client planet** | Mansion/villa on surface | Wordle required to land | Outfit on success |
| **Side planet** | Generic biome (ice, jungle, desert, lava) | Optional landing (press key in proximity) | Outfit piece / ship upgrade / empty |
| **Dead planet** | Barren rock, no building | Fly-by only, decoration | — |

### Ship Upgrades (found on side planets)

| Upgrade | Effect | Duration |
|---|---|---|
| Hyperdrive boost | +40% top speed | Permanent until next delivery |
| Thruster damage | −30% top speed | Permanent until repaired (next pizzeria) |
| Shield fragment | Absorb one asteroid hit | One use |
| Navigation chip | Compass shows exact ETA | Permanent |

---

## WordleScene — Details

- 5-letter word, 6 attempts
- Color feedback per letter: correct position / wrong position / not present
- Words are "encryption keys" — flavor text frames it as decoding
- On **fail**: transition to EscapeScene immediately
- On **success**: docking animation plays, then SuccessScene

---

## EscapeScene — Details

- Weapons lock on, red targeting reticle appears
- **10-second countdown** on screen
- Player must fly spaceship out of a radius zone
- If player escapes: gets new delivery address → SpaceFlightScene
- If hit: GameOver

---

## Sprite & Animation Plan

| Asset | Format | Notes |
|---|---|---|
| Player (cat/dog) | Sprite sheet PNG | Idle, walk, fly, celebrate, hit |
| Spaceship | Sprite sheet PNG | Idle thrust, boost, damaged |
| Asteroids | Multiple PNGs | 3–4 size variants, rotate in engine |
| Space junk | Sprite sheet PNG | Tumbling debris |
| Home planet | Static PNG | Pizzeria building visible on surface |
| Client planet | Static PNG | Mansion/villa on surface, varies per delivery |
| Side planets | Multiple PNGs | Ice, jungle, desert, lava biomes; no building |
| Dead planets | Multiple PNGs | Barren rocks, pure decoration |
| Pizzeria interior | Background PNG | Counter, oven, boxes — intro scene BG |
| Pizzeria exterior | Background PNG | Launchpad + rocket — intro scene BG |
| Weapon turret | Sprite sheet PNG | Aim, fire frames |
| Outfit overlays | PNG per item | Drawn over player sprite |
| Ship upgrade icons | Small PNGs | HUD display when upgrade is active |
| UI elements | Sprite sheet | Compass, HP bar, Wordle grid |

Animation format: frame index array + duration per frame in JSON sidecar or inline in `characters.ts`.

---

## File Structure

```
ludumDare59/
  src/
    engine/           # Pure engine, no game logic
    game/             # All game-specific code
    assets/
      sprites/
      audio/
      fonts/
    main.ts           # Entry point
  public/
    index.html
  plan.md
  vite.config.ts
  tsconfig.json
  package.json
```

---

## Implementation Phases

### Phase 1 — Engine Foundation
- [ ] Vite + TypeScript project setup
- [ ] GameLoop with fixed timestep
- [ ] SceneManager (push/pop)
- [ ] Canvas Renderer + pixel scaling
- [ ] InputManager (keyboard)
- [ ] AssetLoader
- [ ] SpriteSheet + AnimationPlayer
- [ ] Vector2 + AABB collision

### Phase 2 — Space Flight Core
- [ ] SpaceFlightScene skeleton
- [ ] Spaceship entity with thrust physics
- [ ] Asteroid spawning + collision
- [ ] Star parallax background
- [ ] Planet entities: home, client, side, dead — scrolling past
- [ ] Planet proximity detection + landing prompt
- [ ] Compass system + distance display
- [ ] Player death (asteroid hit)

### Phase 3 — Wordle Puzzle
- [ ] WordleScene UI (grid, keyboard)
- [ ] Word validation logic
- [ ] Win/fail transitions

### Phase 4 — Character & Progression
- [ ] CharacterSelectScene (cat/dog)
- [ ] IntroScene scripted sequence (pizzeria interior → exterior → launch)
- [ ] SidePlanetScene + loot roll logic
- [ ] UpgradeSystem (speed buff/debuff, shield, nav chip)
- [ ] OutfitSystem + SuccessScene
- [ ] EscapeScene (turrets + countdown)
- [ ] GameOverScene

### Phase 5 — Polish
- [ ] AudioManager + Howler integration
- [ ] Sound effects (thrust, explosion, wordle hit)
- [ ] Background music loop
- [ ] Screenshake on hit
- [ ] Particle effects (thrust, explosion)
- [ ] UI animations

---

## Open Decisions

| Topic | Options | Recommended |
|---|---|---|
| Word language | English / German / both | English (wider word lists available) |
| Canvas vs WebGL | Canvas 2D / PixiJS | Canvas 2D (keep it simple) |
| Saving progress | localStorage / none | localStorage for outfit unlocks |
| Difficulty scaling | More asteroids over time | Yes, scale per delivery count |
| Controller support | Keyboard only / Gamepad API | Keyboard first, gamepad later |
