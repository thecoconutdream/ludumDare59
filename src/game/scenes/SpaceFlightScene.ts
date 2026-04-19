import { Scene, SceneManager } from '@engine/core/SceneManager'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { Camera } from '@engine/rendering/Camera'
import { Vector2 } from '@engine/physics/Vector2'
import { AABB } from '@engine/physics/AABB'
import { GAME_WIDTH, GAME_HEIGHT } from '@engine/rendering/Renderer'
import { gameState, Biome, Loot } from '@game/data/GameState'
import { WordleScene } from '@game/scenes/WordleScene'
import { SidePlanetScene } from '@game/scenes/SidePlanetScene'
import { GameOverScene } from '@game/scenes/GameOverScene'

// ─── Inline entities ─────────────────────────────────────────────────────────

class Ship {
  pos = Vector2.zero()
  vel = Vector2.zero()
  angle = 0
  shieldHit = false

  readonly DRAG = 0.90

  update(dt: number, input: InputManager, maxSpeed: number): void {
    const thrust = Vector2.zero()
    if (input.isHeld('up'))    thrust.y -= 1
    if (input.isHeld('down'))  thrust.y += 1
    if (input.isHeld('left'))  thrust.x -= 1
    if (input.isHeld('right')) thrust.x += 1

    if (thrust.magnitude() > 0) {
      this.vel = this.vel.add(thrust.normalized().scale(220 * dt))
      this.angle = Math.atan2(this.vel.y, this.vel.x)
    }

    if (this.vel.magnitude() > maxSpeed) {
      this.vel = this.vel.normalized().scale(maxSpeed)
    }

    this.vel = this.vel.scale(this.DRAG)
    this.pos = this.pos.add(this.vel.scale(dt))
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const s = camera.worldToScreen(this.pos)
    ctx.save()
    ctx.translate(s.x, s.y)
    ctx.rotate(this.angle)
    // Placeholder ship: triangle
    ctx.fillStyle = '#44ff88'
    ctx.beginPath()
    ctx.moveTo(12, 0)
    ctx.lineTo(-9, -6)
    ctx.lineTo(-6, 0)
    ctx.lineTo(-9, 6)
    ctx.closePath()
    ctx.fill()
    // Engine glow
    if (Math.random() > 0.5) {
      ctx.fillStyle = '#ff6600'
      ctx.fillRect(-11, -2, 4, 4)
    }
    ctx.restore()

    // Shield ring
    if (gameState.upgrades.shield) {
      ctx.strokeStyle = `rgba(68,170,255,${0.4 + Math.sin(Date.now() / 200) * 0.2})`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(s.x, s.y, 16, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  get bounds(): AABB {
    return new AABB(this.pos.x - 8, this.pos.y - 5, 16, 10)
  }
}

// ─── Star layer ───────────────────────────────────────────────────────────────
class StarLayer {
  private stars: Array<{ x: number; y: number; size: number }>

  constructor(count: number, _speed: number, seed: number) {
    this.stars = Array.from({ length: count }, (_, i) => ({
      x: rng(seed + i * 127.1) * 320,
      y: rng(seed + i * 311.7) * 180,
      size: seed > 2 ? 2 : 1,
    }))
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#ffffff'
    for (const s of this.stars) {
      ctx.fillRect(s.x, s.y, s.size, s.size)
    }
  }
}

function rng(seed: number): number {
  const x = Math.sin(seed) * 43758.5453
  return x - Math.floor(x)
}

// ─── Planet data ──────────────────────────────────────────────────────────────
type PlanetType = 'home' | 'client' | 'side' | 'dead'

interface Planet {
  id: string
  pos: Vector2
  type: PlanetType
  biome?: Biome
  loot?: Loot
  radius: number
  color: string
  label: string
  variant: number
}

const PLANET_COLORS: Record<PlanetType, string> = {
  home:   '#ff8833',
  client: '#aa44ff',
  side:   '#44aaff',
  dead:   '#555566',
}

const BIOME_COLORS: Record<string, string> = {
  ice: '#aaddff', jungle: '#44aa44', desert: '#ddaa44', lava: '#ff4400',
}

function generateRoute(deliveryCount: number): Planet[] {
  const seed = deliveryCount * 1337
  const angle = rng(seed) * Math.PI * 2
  const dist = 1800 + rng(seed * 1.7) * 600
  const clientPos = new Vector2(Math.cos(angle) * dist, Math.sin(angle) * dist)
  const biomes: Biome[] = ['ice', 'jungle', 'desert', 'lava']
  const loots: Loot[] = ['outfit', 'upgrade', 'empty', 'empty']

  const planets: Planet[] = [
    {
      id: 'home',
      pos: Vector2.zero(),
      type: 'home', radius: 30,
      color: PLANET_COLORS.home,
      label: 'COSMIC PIZZA', variant: 0,
    },
    {
      id: 'client',
      pos: clientPos,
      type: 'client', radius: 28,
      color: PLANET_COLORS.client,
      label: 'DELIVERY TARGET', variant: (deliveryCount % 3) + 1,
    },
  ]

  // 4 side planets scattered along the route
  for (let i = 0; i < 4; i++) {
    const t = (i + 1) / 5
    const base = clientPos.scale(t)
    const perpAngle = angle + Math.PI / 2 + rng(seed + i * 77) * Math.PI
    const offset = 250 + rng(seed + i * 200) * 200
    planets.push({
      id: `side_${i}`,
      pos: base.add(new Vector2(Math.cos(perpAngle) * offset, Math.sin(perpAngle) * offset)),
      type: 'side',
      biome: biomes[i % 4],
      loot: loots[i % 4],
      radius: 20,
      color: BIOME_COLORS[biomes[i % 4]],
      label: biomes[i % 4].toUpperCase(),
      variant: (i % 2) + 1,
    })
  }

  // 3 dead planets
  for (let i = 0; i < 3; i++) {
    const t = (i + 1) / 4
    const base = clientPos.scale(t)
    const a = angle + Math.PI / 2 * (i % 2 === 0 ? 1 : -1) + rng(seed + i * 500) * 0.5
    planets.push({
      id: `dead_${i}`,
      pos: base.add(new Vector2(Math.cos(a) * (150 + i * 80), Math.sin(a) * (150 + i * 80))),
      type: 'dead', radius: 14,
      color: PLANET_COLORS.dead,
      label: '', variant: (i % 3) + 1,
    })
  }

  return planets
}

// ─── Asteroid ─────────────────────────────────────────────────────────────────
interface Asteroid {
  pos: Vector2
  vel: Vector2
  radius: number
  rotation: number
  rotSpeed: number
  variantKey: string
}

// ─── Scene ────────────────────────────────────────────────────────────────────
export class SpaceFlightScene implements Scene {
  private ship = new Ship()
  private camera = new Camera()
  private starLayers: StarLayer[]
  private planets: Planet[]
  private asteroids: Asteroid[] = []
  private asteroidTimer = 0
  private nearbyPlanet: Planet | null = null
  private visitedSides = new Set<string>()
  private screenShake = 0
  private interactionCooldown = 0  // prevents re-triggering land prompt on resume

  constructor(
    private scenes: SceneManager,
    private input: InputManager,
    private assets: AssetLoader,
  ) {
    this.starLayers = [
      new StarLayer(40, 0, 1),   // static — stars are infinitely far away
      new StarLayer(25, 0, 2),
      new StarLayer(12, 0, 3),
    ]
    this.planets = generateRoute(gameState.deliveryCount)
    this.visitedSides = new Set(gameState.visitedSidePlanets)
  }

  onEnter(): void {
    this.ship.pos = new Vector2(50, 0)
    this.camera.position = this.ship.pos.clone()
  }

  onResume(): void {
    // Returning from SidePlanetScene — ship and camera state preserved, just
    // add a short cooldown so the E key from the landing doesn't re-trigger
    this.interactionCooldown = 0.4
  }

  onExit(): void {}

  update(dt: number): void {
    if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt * 5)
    if (this.interactionCooldown > 0) this.interactionCooldown -= dt

    this.ship.update(dt, this.input, gameState.maxSpeed)
    this.camera.follow(this.ship.pos, 0.08)

    // Asteroid spawning — more frequent as deliveries go on
    const spawnInterval = Math.max(1.2, 2.5 - gameState.deliveryCount * 0.1)
    this.asteroidTimer += dt
    if (this.asteroidTimer > spawnInterval) {
      this.spawnAsteroid()
      this.asteroidTimer = 0
    }

    for (const a of this.asteroids) {
      a.pos = a.pos.add(a.vel.scale(dt))
      a.rotation += a.rotSpeed * dt
    }

    this.asteroids = this.asteroids.filter(a =>
      a.pos.distanceTo(this.ship.pos) < 500,
    )

    // Collision with asteroids
    const shipBounds = this.ship.bounds
    for (const a of this.asteroids) {
      const ab = new AABB(a.pos.x - a.radius, a.pos.y - a.radius, a.radius * 2, a.radius * 2)
      if (shipBounds.intersects(ab)) {
        if (gameState.upgrades.shield) {
          gameState.upgrades.shield = false
          this.asteroids = this.asteroids.filter(x => x !== a)
          this.screenShake = 1
        } else {
          this.scenes.replace(new GameOverScene(this.scenes, this.input, this.assets))
          return
        }
      }
    }

    // Planet proximity
    this.nearbyPlanet = null
    for (const planet of this.planets) {
      const dist = this.ship.pos.distanceTo(planet.pos)
      const threshold = planet.radius + 25
      if (dist < threshold && planet.type !== 'home' && planet.type !== 'dead') {
        this.nearbyPlanet = planet
        break
      }
    }

    if (this.nearbyPlanet) {
      if (this.nearbyPlanet.type === 'client' && this.input.isPressed('confirm')) {
        gameState.clientVariant = this.nearbyPlanet.variant
        this.scenes.replace(new WordleScene(this.scenes, this.input, this.assets))
      }

      if (this.nearbyPlanet.type === 'side' && this.input.isPressed('land') && this.interactionCooldown <= 0) {
        const planet = this.nearbyPlanet
        if (!this.visitedSides.has(planet.id)) {
          this.visitedSides.add(planet.id)
          gameState.visitedSidePlanets.add(planet.id)
          gameState.pendingBiome = planet.biome ?? 'ice'
          gameState.pendingLoot = planet.loot ?? 'empty'
          this.scenes.push(new SidePlanetScene(this.scenes, this.input, this.assets))
        }
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const sx = this.screenShake > 0 ? Math.round((Math.random() - 0.5) * 4) : 0
    const sy = this.screenShake > 0 ? Math.round((Math.random() - 0.5) * 4) : 0
    ctx.save()
    ctx.translate(sx, sy)

    ctx.fillStyle = '#070710'
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    for (const layer of this.starLayers) layer.render(ctx)

    for (const planet of this.planets) this.renderPlanet(ctx, planet)

    for (const a of this.asteroids) this.renderAsteroid(ctx, a)

    this.ship.render(ctx, this.camera)

    ctx.restore()
    this.renderHUD(ctx)
  }

  private renderPlanet(ctx: CanvasRenderingContext2D, planet: Planet): void {
    const s = this.camera.worldToScreen(planet.pos)
    if (s.x < -60 || s.x > GAME_WIDTH + 60 || s.y < -60 || s.y > GAME_HEIGHT + 60) return

    const visited = this.visitedSides.has(planet.id)

    ctx.save()
    ctx.beginPath()
    ctx.arc(s.x, s.y, planet.radius, 0, Math.PI * 2)
    ctx.fillStyle = planet.color + (visited ? '55' : 'bb')
    ctx.fill()
    ctx.strokeStyle = planet.color
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.restore()

    // Label
    if (planet.type !== 'dead') {
      ctx.fillStyle = planet.type === 'client' ? '#ffcc00' : '#aaaacc'
      ctx.font = '5px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(planet.label, s.x, s.y + planet.radius + 8)
    }

    // Proximity ring on client planet
    if (planet.type === 'client') {
      const dist = this.ship.pos.distanceTo(planet.pos)
      const threshold = planet.radius + 25
      const alpha = Math.max(0, 1 - dist / (threshold * 3))
      ctx.strokeStyle = `rgba(255,204,0,${alpha})`
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.arc(s.x, s.y, threshold, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }

  private renderAsteroid(ctx: CanvasRenderingContext2D, a: Asteroid): void {
    const s = this.camera.worldToScreen(a.pos)
    if (s.x < -50 || s.x > GAME_WIDTH + 50 || s.y < -50 || s.y > GAME_HEIGHT + 50) return

    ctx.save()
    ctx.translate(s.x, s.y)
    ctx.rotate(a.rotation)
    ctx.fillStyle = '#776655'
    ctx.strokeStyle = '#998877'
    ctx.lineWidth = 1
    const r = a.radius
    ctx.beginPath()
    ctx.moveTo(r, 0)
    ctx.lineTo(r * 0.5, -r)
    ctx.lineTo(-r * 0.7, -r * 0.8)
    ctx.lineTo(-r, -r * 0.3)
    ctx.lineTo(-r * 0.8, r * 0.6)
    ctx.lineTo(-r * 0.2, r)
    ctx.lineTo(r * 0.6, r * 0.7)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }

  private renderHUD(ctx: CanvasRenderingContext2D): void {
    const client = this.planets.find(p => p.type === 'client')!
    const dist = Math.floor(this.ship.pos.distanceTo(client.pos))
    const angle = this.ship.pos.angleTo(client.pos)

    // Compass — top-right
    const cx = GAME_WIDTH - 18, cy = 18
    ctx.strokeStyle = '#334455'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, cy, 11, 0, Math.PI * 2)
    ctx.stroke()
    ctx.strokeStyle = '#ff4444'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(angle) * 9, cy + Math.sin(angle) * 9)
    ctx.stroke()

    // Nav chip: show ETA
    if (gameState.upgrades.navChip) {
      const speed = this.ship.vel.magnitude()
      const eta = speed > 5 ? Math.ceil(dist / speed) : '?'
      ctx.fillStyle = '#44ff88'
      ctx.font = '5px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(`ETA ${eta}s`, GAME_WIDTH - 4, cy + 18)
    }

    // Distance
    ctx.fillStyle = '#aaaacc'
    ctx.font = '5px monospace'
    ctx.textAlign = 'right'
    ctx.fillText(`${dist}u`, GAME_WIDTH - 4, cy + 12)

    // Delivery badge — top-left
    ctx.fillStyle = '#ffcc00'
    ctx.font = '6px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(`DELIVERY #${gameState.deliveryCount + 1}`, 4, 10)

    // Active upgrade icons
    let iconX = 4
    const iconY = 18
    ctx.font = '5px monospace'
    if (gameState.upgrades.hyperdrive)      { ctx.fillStyle = '#4488ff'; ctx.fillText('BOOST', iconX, iconY); iconX += 28 }
    if (gameState.upgrades.thrusterDamaged) { ctx.fillStyle = '#ff8800'; ctx.fillText('DMGD',  iconX, iconY); iconX += 24 }
    if (gameState.upgrades.shield)          { ctx.fillStyle = '#44aaff'; ctx.fillText('SHLD',  iconX, iconY); iconX += 24 }
    if (gameState.upgrades.navChip)         { ctx.fillStyle = '#44ff88'; ctx.fillText('NAV',   iconX, iconY) }

    // Nearby planet prompt
    if (this.nearbyPlanet) {
      const isVisited = this.nearbyPlanet.type === 'side' && this.visitedSides.has(this.nearbyPlanet.id)
      ctx.textAlign = 'center'
      if (this.nearbyPlanet.type === 'client') {
        ctx.fillStyle = '#ffcc00'
        ctx.font = '7px monospace'
        ctx.fillText('[ENTER] APPROACH PLANET', GAME_WIDTH / 2, GAME_HEIGHT - 10)
      } else if (this.nearbyPlanet.type === 'side' && !isVisited) {
        ctx.fillStyle = '#44aaff'
        ctx.font = '7px monospace'
        ctx.fillText('[E] LAND', GAME_WIDTH / 2, GAME_HEIGHT - 10)
      } else if (isVisited) {
        ctx.fillStyle = '#556677'
        ctx.font = '6px monospace'
        ctx.fillText('(already explored)', GAME_WIDTH / 2, GAME_HEIGHT - 10)
      }
    }
  }

  private spawnAsteroid(): void {
    const variants = ['asteroid_small_1','asteroid_small_2','asteroid_small_3',
                      'asteroid_medium_1','asteroid_medium_2','asteroid_medium_3',
                      'asteroid_large_1','asteroid_large_2']
    const radii =    [4, 4, 4, 8, 8, 8, 12, 12]

    const spawnAngle = this.ship.angle + (Math.random() - 0.5) * Math.PI * 1.2
    const spawnDist = 180 + Math.random() * 60
    const varIdx = Math.floor(Math.random() * variants.length)

    this.asteroids.push({
      pos: this.ship.pos.add(new Vector2(Math.cos(spawnAngle) * spawnDist, Math.sin(spawnAngle) * spawnDist)),
      vel: new Vector2((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40),
      radius: radii[varIdx],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 2,
      variantKey: variants[varIdx],
    })
  }
}
