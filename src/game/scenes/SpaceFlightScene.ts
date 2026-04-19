import { Scene, SceneManager } from '@engine/core/SceneManager'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { Camera } from '@engine/rendering/Camera'
import { Vector2 } from '@engine/physics/Vector2'
import { GAME_WIDTH, GAME_HEIGHT } from '@engine/rendering/Renderer'
import { gameState } from '@game/data/GameState'
import { FONT_SM } from '@game/data/ui'
import { Ship } from '@game/entities/Ship'
import { StarLayer } from '@game/entities/StarLayer'
import { Planet } from '@game/entities/Planet'
import { AsteroidSystem } from '@game/entities/AsteroidSystem'
import { WordleScene } from '@game/scenes/WordleScene'
import { SidePlanetScene } from '@game/scenes/SidePlanetScene'
import { GameOverScene } from '@game/scenes/GameOverScene'
import { debugSettings } from '@game/data/debug'

export class SpaceFlightScene implements Scene {
  private ship: Ship
  private camera = new Camera()
  private starLayers: StarLayer[]
  private planets: Planet[]
  private asteroids = new AsteroidSystem()
  private asteroidTimer = 0
  private nearbyPlanet: Planet | null = null
  private visitedSides = new Set<string>()
  private screenShake = 0
  private interactionCooldown = 0
  private hitTimer = 0

  constructor(
    private scenes: SceneManager,
    private input: InputManager,
    private assets: AssetLoader,
  ) {
    this.ship = new Ship(assets)
    this.starLayers = [new StarLayer(40, 1), new StarLayer(25, 2), new StarLayer(12, 3)]
    this.planets = Planet.generateRoute(gameState.deliveryCount)
    this.visitedSides = new Set(gameState.visitedSidePlanets)
  }

  onEnter(): void {
    this.ship.pos = new Vector2(50, 0)
    this.camera.position = this.ship.pos.clone()
    this.asteroids.populate(this.ship.pos, 40)
  }

  onResume(): void {
    this.interactionCooldown = 0.4
  }

  onExit(): void {}

  update(dt: number): void {
    if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt * 5)
    if (this.interactionCooldown > 0) this.interactionCooldown -= dt

    if (this.hitTimer > 0) {
      this.hitTimer -= dt
      this.ship.update(dt, this.input, gameState.maxSpeed)
      this.camera.follow(this.ship.pos, 0.08)
      if (this.hitTimer <= 0) {
        this.scenes.replace(new GameOverScene(this.scenes, this.input, this.assets))
      }
      return
    }

    this.ship.update(dt, this.input, gameState.maxSpeed)
    this.camera.follow(this.ship.pos, 0.08)

    const spawnInterval = Math.max(1.2, 2.5 - gameState.deliveryCount * 0.1)
    this.asteroidTimer += dt
    if (this.asteroidTimer > spawnInterval) {
      this.asteroids.spawn(this.ship.pos, this.ship.angle)
      this.asteroidTimer = 0
    }
    this.asteroids.update(dt, this.ship.pos)

    const hit = this.asteroids.checkCollision(this.ship.bounds)
    if (hit) {
      if (gameState.upgrades.shield) {
        gameState.upgrades.shield = false
        this.asteroids.remove(hit)
        this.screenShake = 1
      } else {
        this.ship.triggerHit()
        this.screenShake = 1.5
        this.hitTimer = 0.9
      }
    }

    this.nearbyPlanet = null
    for (const planet of this.planets) {
      if (planet.type !== 'home' && planet.type !== 'dead' && planet.isNearby(this.ship.pos)) {
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

    const zoom = debugSettings.zoom
    if (zoom !== 1) {
      ctx.translate(GAME_WIDTH / 2, GAME_HEIGHT / 2)
      ctx.scale(zoom, zoom)
      ctx.translate(-GAME_WIDTH / 2, -GAME_HEIGHT / 2)
    }

    ctx.fillStyle = '#070710'
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    for (const layer of this.starLayers) layer.render(ctx)
    for (const planet of this.planets) planet.render(ctx, this.camera, this.visitedSides.has(planet.id))
    for (const planet of this.planets) {
      if (planet.type === 'client') planet.renderProximityRing(ctx, this.camera, this.ship.pos)
    }
    this.asteroids.render(ctx, this.camera)
    this.ship.render(ctx, this.camera)

    ctx.restore()
    this.renderHUD(ctx)
  }

  private renderHUD(ctx: CanvasRenderingContext2D): void {
    const client = this.planets.find(p => p.type === 'client')!
    const dist = Math.floor(this.ship.pos.distanceTo(client.pos))
    const angle = this.ship.pos.angleTo(client.pos)

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

    ctx.font = FONT_SM
    ctx.textAlign = 'right'
    ctx.fillStyle = '#aaaacc'
    ctx.fillText(`${dist}u`, GAME_WIDTH - 4, cy + 12)

    if (gameState.upgrades.navChip) {
      const speed = this.ship.vel.magnitude()
      const eta = speed > 5 ? Math.ceil(dist / speed) : '?'
      ctx.fillStyle = '#44ff88'
      ctx.fillText(`ETA ${eta}s`, GAME_WIDTH - 4, cy + 22)
    }

    ctx.textAlign = 'left'
    ctx.fillStyle = '#ffcc00'
    ctx.fillText(`DELIVERY #${gameState.deliveryCount + 1}`, 4, 10)

    let iconX = 4
    const iconY = 22
    if (gameState.upgrades.hyperdrive)      { ctx.fillStyle = '#4488ff'; ctx.fillText('BOOST', iconX, iconY); iconX += 36 }
    if (gameState.upgrades.thrusterDamaged) { ctx.fillStyle = '#ff8800'; ctx.fillText('DMGD',  iconX, iconY); iconX += 30 }
    if (gameState.upgrades.shield)          { ctx.fillStyle = '#44aaff'; ctx.fillText('SHLD',  iconX, iconY); iconX += 30 }
    if (gameState.upgrades.navChip)         { ctx.fillStyle = '#44ff88'; ctx.fillText('NAV',   iconX, iconY) }

    if (this.nearbyPlanet) {
      const isVisited = this.nearbyPlanet.type === 'side' && this.visitedSides.has(this.nearbyPlanet.id)
      ctx.textAlign = 'center'
      if (this.nearbyPlanet.type === 'client') {
        ctx.fillStyle = '#ffcc00'
        ctx.fillText('[ENTER] APPROACH', GAME_WIDTH / 2, GAME_HEIGHT - 10)
      } else if (this.nearbyPlanet.type === 'side' && !isVisited) {
        ctx.fillStyle = '#44aaff'
        ctx.fillText('[E] LAND', GAME_WIDTH / 2, GAME_HEIGHT - 10)
      } else if (isVisited) {
        ctx.fillStyle = '#556677'
        ctx.fillText('(explored)', GAME_WIDTH / 2, GAME_HEIGHT - 10)
      }
    }
  }
}
