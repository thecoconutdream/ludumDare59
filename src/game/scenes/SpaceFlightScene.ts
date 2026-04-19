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
import { PickupSystem } from '@game/entities/PickupSystem'
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
  private pickups = new PickupSystem()
  private asteroidTimer = 0
  private nearbyPlanet: Planet | null = null
  private visitedSides = new Set<string>()
  private screenShake = 0
  private interactionCooldown = 0
  private hitTimer = 0
  private invincibilityTimer = 0
  private failedDelivery = false

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
    if (gameState.escapedFromPos) {
      this.ship.pos = new Vector2(gameState.escapedFromPos.x + 60, gameState.escapedFromPos.y)
      gameState.escapedFromPos = null
      this.failedDelivery = true
    } else {
      this.ship.pos = new Vector2(50, 0)
    }
    this.camera.position = this.ship.pos.clone()
    this.asteroids.populate(this.ship.pos, 40)
    this.pickups.populate(this.ship.pos, 3, 2)
  }

  onResume(): void {
    this.interactionCooldown = 0.4
    if (gameState.upgrades.hyperdrive) this.ship.activateHyperdrive()
  }

  onExit(): void {}

  update(dt: number): void {
    if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt * 5)
    if (this.interactionCooldown > 0) this.interactionCooldown -= dt

    if (this.invincibilityTimer > 0) this.invincibilityTimer -= dt

    if (this.hitTimer > 0) {
      this.hitTimer -= dt
      this.ship.tick(dt, this.input, gameState.maxSpeed)
      this.camera.follow(this.ship.pos, 0.08)
      if (this.hitTimer <= 0) {
        if (gameState.lives <= 0) {
          this.scenes.replace(new GameOverScene(this.scenes, this.input, this.assets))
        } else {
          this.ship.resetState()
          this.invincibilityTimer = 2.5
        }
      }
      return
    }

    this.ship.tick(dt, this.input, gameState.maxSpeed)
    this.camera.follow(this.ship.pos, 0.08)

    const spawnInterval = Math.max(1.2, 2.5 - gameState.deliveryCount * 0.1)
    this.asteroidTimer += dt
    if (this.asteroidTimer > spawnInterval) {
      this.asteroids.spawn(this.ship.pos, this.ship.angle)
      this.asteroidTimer = 0
    }
    this.asteroids.update(dt, this.ship.pos)
    this.pickups.update(dt, this.ship.pos)

    const collected = this.pickups.checkCollection(this.ship.pos)
    if (collected) {
      this.pickups.remove(collected)
      if (collected.type === 'hyperdrive') {
        this.ship.activateHyperdrive()
        gameState.upgrades.hyperdrive = true
      } else {
        gameState.upgrades.shield = true
      }
    }

    const hit = this.invincibilityTimer <= 0 ? this.asteroids.checkCollision(this.ship.bounds) : null
    if (hit) {
      if (gameState.upgrades.shield) {
        gameState.upgrades.shield = false
        this.asteroids.remove(hit)
        this.ship.vel = this.ship.vel.normalized().scale(-50)
        this.screenShake = 1.2
      } else {
        gameState.lives--
        this.ship.triggerHit()
        this.screenShake = 1.5
        this.hitTimer = 0.9
      }
    }

    this.nearbyPlanet = null
    for (const planet of this.planets) {
      const isHome = planet.type === 'home'
      if (planet.type === 'dead') continue
      if (isHome && !this.failedDelivery) continue
      if (planet.isNearby(this.ship.pos)) { this.nearbyPlanet = planet; break }
    }

    if (this.nearbyPlanet) {
      if (this.nearbyPlanet.type === 'home' && this.input.isPressed('confirm')) {
        this.failedDelivery = false
        this.scenes.replace(new SpaceFlightScene(this.scenes, this.input, this.assets))
        return
      }
      if (this.nearbyPlanet.type === 'client' && !this.failedDelivery && this.input.isPressed('confirm')) {
        const client = this.nearbyPlanet
        gameState.clientVariant = client.variant
        gameState.escapedFromPos = { x: client.pos.x, y: client.pos.y }
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
    for (const planet of this.planets) {
      const armed = this.failedDelivery && planet.type === 'client'
      planet.render(ctx, this.camera, this.assets, this.visitedSides.has(planet.id), armed)
    }
    for (const planet of this.planets) {
      if (planet.type === 'client') planet.renderProximityRing(ctx, this.camera, this.ship.pos)
    }
    this.asteroids.render(ctx, this.camera, this.assets)
    this.pickups.render(ctx, this.camera)
    this.ship.render(ctx, this.camera)

    ctx.restore()
    this.renderHUD(ctx)
  }

  private renderHUD(ctx: CanvasRenderingContext2D): void {
    const target = this.failedDelivery
      ? this.planets.find(p => p.type === 'home')!
      : this.planets.find(p => p.type === 'client')!
    const dist = Math.floor(this.ship.pos.distanceTo(target.pos))
    const angle = this.ship.pos.angleTo(target.pos)

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

    this.renderLives(ctx)

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
      if (this.nearbyPlanet.type === 'home') {
        ctx.fillStyle = '#44ff88'
        ctx.fillText('[ENTR] BACK TO PIZZERIA', GAME_WIDTH / 2, GAME_HEIGHT - 10)
      } else if (this.nearbyPlanet.type === 'client' && !this.failedDelivery) {
        ctx.fillStyle = '#ffcc00'
        ctx.fillText('[ENTR] APPROACH', GAME_WIDTH / 2, GAME_HEIGHT - 10)
      } else if (this.nearbyPlanet.type === 'client' && this.failedDelivery) {
        ctx.fillStyle = '#ff4444'
        ctx.fillText('ACCESS DENIED', GAME_WIDTH / 2, GAME_HEIGHT - 10)
      } else if (this.nearbyPlanet.type === 'side' && !isVisited) {
        ctx.fillStyle = '#44aaff'
        ctx.fillText('[E] LAND', GAME_WIDTH / 2, GAME_HEIGHT - 10)
      } else if (isVisited) {
        ctx.fillStyle = '#556677'
        ctx.fillText('(explored)', GAME_WIDTH / 2, GAME_HEIGHT - 10)
      }
    }
  }

  private renderLives(ctx: CanvasRenderingContext2D): void {
    const charKey = gameState.character === 'cat' ? 'player_cat' : 'player_dog'
    const img = this.assets.getImage(charKey)
    const iconW = 10, iconH = 15
    const gap = 4
    const total = 3 * iconW + 2 * gap
    const startX = Math.floor(GAME_WIDTH / 2 - total / 2)
    const blink = this.invincibilityTimer > 0 && Math.floor(Date.now() / 120) % 2 === 0

    for (let i = 0; i < 3; i++) {
      const x = startX + i * (iconW + gap)
      ctx.globalAlpha = i < gameState.lives ? (blink ? 0.3 : 1) : 0.2
      ctx.drawImage(img, 0, 0, 32, 48, x, 2, iconW, iconH)
    }
    ctx.globalAlpha = 1
  }
}
