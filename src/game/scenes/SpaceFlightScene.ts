import { Scene, SceneManager } from '@engine/core/SceneManager'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { AudioManager } from '@engine/audio/AudioManager'
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

interface Bullet {
  pos: Vector2
  vel: Vector2
  hue: number
  life: number
}

export class SpaceFlightScene implements Scene {
  private ship: Ship
  private camera = new Camera()
  private starLayers: StarLayer[]
  private planets: Planet[]
  private asteroids = new AsteroidSystem()
  private pickups = new PickupSystem()
  private asteroidTimer = 0
  private shieldSpawnTimer = 0
  private nearbyPlanet: Planet | null = null
  private visitedSides = new Set<string>()
  private screenShake = 0
  private interactionCooldown = 0
  private hitTimer = 0
  private invincibilityTimer = 0
  private failedDelivery = false
  private bullets: Bullet[] = []
  private shootCooldown = 0
  private bulletHue = 0
  private pickupToastText = ''
  private pickupToastTimer = 0

  constructor(
    private scenes: SceneManager,
    private input: InputManager,
    private assets: AssetLoader,
    private audio: AudioManager,
  ) {
    this.ship = new Ship(assets)
    this.camera.zoom = 0.75
    this.starLayers = [new StarLayer(40, 1), new StarLayer(25, 2), new StarLayer(12, 3)]
    this.planets = Planet.generateRoute(gameState.deliveryCount)
    this.visitedSides = new Set(gameState.visitedSidePlanets)
  }

  onEnter(): void {
    this.audio.stop('music_menu')
    this.audio.stop('music_tense')
    if (!this.audio.isPlaying('music_space')) this.audio.play('music_space')

    if (gameState.escapedFromPos) {
      this.ship.pos = new Vector2(gameState.escapedFromPos.x + 60, gameState.escapedFromPos.y)
      gameState.escapedFromPos = null
      this.failedDelivery = true
    } else {
      this.ship.pos = new Vector2(50, 0)
    }
    this.camera.position = this.ship.pos.clone()
    this.applyUpgrades()
    const clientPlanet = this.planets.find(p => p.type === 'client')
    this.bullets = []
    this.asteroids.clear()
    this.asteroids.populateInBounds(this.planets.map(p => p.pos), this.ship.pos, 200, 120)
    const orbitPlanets = this.planets.filter(p => p.type === 'client' || p.type === 'side')
    this.asteroids.populateOrbiting(orbitPlanets.map(p => p.pos))
    this.pickups.populate(this.ship.pos, 1, 3, clientPlanet?.pos)
  }

  onResume(): void {
    this.interactionCooldown = 0.4
    this.applyUpgrades()
  }

  private applyUpgrades(): void {
    if (gameState.upgrades.hyperdrive) this.ship.activateHyperdrive()
  }

  onExit(): void {
    this.audio.stop('thrust')
    this.audio.stop('speed')
  }

  update(dt: number): void {
    if (this.pickupToastTimer > 0) this.pickupToastTimer = Math.max(0, this.pickupToastTimer - dt)

    if (debugSettings.pendingWarp === 'cannon') {
      const gunPlanet = this.planets.find(p => p.loot === 'cannon')
      if (gunPlanet) {
        this.ship.pos = gunPlanet.pos.add(new Vector2(30, 0))
        this.camera.position = this.ship.pos.clone()
      }
      debugSettings.pendingWarp = null
    }

    if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt * 5)
    if (this.interactionCooldown > 0) this.interactionCooldown -= dt

    if (this.invincibilityTimer > 0) this.invincibilityTimer -= dt

    if (this.hitTimer > 0) {
      this.hitTimer -= dt
      this.ship.tick(dt, this.input, gameState.maxSpeed)
      this.camera.follow(this.ship.pos, 0.08)
      if (this.hitTimer <= 0) {
        if (gameState.lives <= 0) {
          this.scenes.replace(new GameOverScene(this.scenes, this.input, this.assets, this.audio))
        } else {
          this.ship.resetState()
          this.applyUpgrades()
          this.invincibilityTimer = 2.5
        }
      }
      return
    }

    this.ship.tick(dt, this.input, gameState.maxSpeed)
    this.camera.follow(this.ship.pos, 0.08)

    const thrusting = this.input.isHeld('up')
    if (thrusting && gameState.upgrades.hyperdrive) {
      this.audio.stop('thrust')
      if (!this.audio.isPlaying('speed')) this.audio.play('speed')
    } else if (thrusting) {
      this.audio.stop('speed')
      if (!this.audio.isPlaying('thrust')) this.audio.play('thrust')
    } else {
      this.audio.stop('thrust')
      this.audio.stop('speed')
    }

    const spawnInterval = Math.max(1.2, 2.5 - gameState.deliveryCount * 0.1)
    this.asteroidTimer += dt
    if (this.asteroidTimer > spawnInterval) {
      this.asteroids.spawn(this.ship.pos, this.ship.angle)
      this.asteroidTimer = 0
    }
    this.asteroids.update(dt, this.ship.pos)
    this.pickups.update(dt, this.ship.pos)

    this.shieldSpawnTimer += dt
    if (this.shieldSpawnTimer >= 18) {
      this.pickups.spawnShield(this.ship.pos)
      this.shieldSpawnTimer = 0
    }

    const collected = this.pickups.checkCollection(this.ship.pos)
    if (collected) {
      const shieldFull = collected.type === 'shield' && gameState.upgrades.shield >= 3
      if (!shieldFull) {
        this.audio.play('pickup')
        this.pickups.remove(collected)
        if (collected.type === 'hyperdrive') {
          gameState.upgrades.hyperdrive++
          this.ship.activateHyperdrive()
          this.showPickupToast('DRIVE UPGRADED')
        } else {
          gameState.upgrades.shield++
          this.showPickupToast('SHIELD CHARGED')
        }
      }
    }

    if (this.shootCooldown > 0) this.shootCooldown -= dt
    if (gameState.upgrades.cannonLevel > 0 && this.input.isPressed('shoot')) {
      const cooldown = 1 + (4 - gameState.upgrades.cannonLevel) * (2 / 3)
      if (this.shootCooldown <= 0) {
        const dir = new Vector2(Math.cos(this.ship.angle), Math.sin(this.ship.angle))
        this.bullets.push({
          pos: this.ship.pos.clone(),
          vel: dir.scale(300).add(this.ship.vel),
          hue: this.bulletHue,
          life: 2,
        })
        this.bulletHue = (this.bulletHue + 40) % 360
        this.shootCooldown = cooldown
        this.audio.play('laser')
      }
    }

    for (const b of this.bullets) {
      b.pos = b.pos.add(b.vel.scale(dt))
      b.life -= dt
    }
    this.bullets = this.bullets.filter(b => b.life > 0)

    for (const b of [...this.bullets]) {
      const hit = this.asteroids.checkBulletHit(b.pos)
      if (hit) {
        this.asteroids.remove(hit)
        this.bullets = this.bullets.filter(x => x !== b)
      }
    }

    const hit = this.invincibilityTimer <= 0 ? this.asteroids.checkCollision(this.ship.bounds) : null
    if (hit) {
      if (gameState.upgrades.shield > 0) {
        gameState.upgrades.shield--
        this.asteroids.remove(hit)
        this.ship.vel = this.ship.vel.normalized().scale(-50)
        this.screenShake = 1.2
        this.audio.play('shield_hit')
      } else {
        gameState.lives--
        this.ship.triggerHit()
        this.screenShake = 1.5
        this.hitTimer = 0.9
        this.audio.stop('thrust')
        this.audio.play('hit')
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
        this.scenes.replace(new SpaceFlightScene(this.scenes, this.input, this.assets, this.audio))
        return
      }
      if (this.nearbyPlanet.type === 'client' && !this.failedDelivery && this.input.isPressed('confirm')) {
        const client = this.nearbyPlanet
        gameState.clientVariant = client.variant
        gameState.escapedFromPos = { x: client.pos.x, y: client.pos.y }
        this.scenes.replace(new WordleScene(this.scenes, this.input, this.assets, this.audio))
      }
      if (this.nearbyPlanet.type === 'side' && this.input.isPressed('land') && this.interactionCooldown <= 0) {
        const planet = this.nearbyPlanet
        if (!this.visitedSides.has(planet.id)) {
          this.visitedSides.add(planet.id)
          gameState.visitedSidePlanets.add(planet.id)
          gameState.pendingBiome = planet.biome ?? 'ice'
          gameState.pendingLoot = planet.loot ?? 'empty'
          this.audio.play('land')
          this.scenes.push(new SidePlanetScene(this.scenes, this.input, this.assets, this.audio))
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
    for (const b of this.bullets) {
      const s = this.camera.worldToScreen(b.pos)
      const offsets = [[-2, -1], [2, 0], [0, 2], [-1, 1]]
      for (let i = 0; i < offsets.length; i++) {
        const hue = (b.hue + i * 90) % 360
        ctx.fillStyle = `hsl(${hue}, 100%, 65%)`
        ctx.beginPath()
        ctx.arc(s.x + offsets[i][0], s.y + offsets[i][1], 2, 0, Math.PI * 2)
        ctx.fill()
      }
      b.hue = (b.hue + 25) % 360
    }

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
    if (this.assets.hasImage('pizza')) {
      ctx.drawImage(this.assets.getImage('pizza'), 0, 0, 32, 48, 4, 2, 8, 12)
      ctx.fillText(`#${gameState.deliveryCount + 1}`, 15, 12)
    } else {
      ctx.fillText(`DELIVERY #${gameState.deliveryCount + 1}`, 4, 10)
    }

    // Outfit icons — bottom-left, one per collected hat, active highlighted
    if (gameState.unlockedOutfits.length > 0) {
      const HAT_W = 14, HAT_H = 21, HAT_GAP = 4
      const HAT_Y = GAME_HEIGHT - HAT_H - 4
      let hatX = 4
      for (const key of gameState.unlockedOutfits) {
        const iconKey = `icon_${key}`
        if (this.assets.hasImage(iconKey)) {
          if (gameState.activeOutfit === key) {
            ctx.strokeStyle = '#ffcc00'
            ctx.lineWidth = 1
            ctx.strokeRect(hatX - 2, HAT_Y - 2, HAT_W + 4, HAT_H + 4)
          }
          ctx.drawImage(this.assets.getImage(iconKey), 0, 0, 32, 48, hatX, HAT_Y, HAT_W, HAT_H)
          hatX += HAT_W + HAT_GAP
        }
      }
    }

    ctx.textAlign = 'left'
    let iconY = 22
    if (gameState.upgrades.hyperdrive) {
      const spd = Math.round(gameState.maxSpeed)
      const acc = Math.round(this.ship.acceleration)
      const brk = Math.round(this.ship.brakeDeceleration)
      ctx.fillStyle = '#4488ff'
      ctx.fillText(`SPD ${spd}`, 4, iconY); iconY += 12
      ctx.fillText(`ACC ${acc}`, 4, iconY); iconY += 12
      ctx.fillText(`BRK ${brk}`, 4, iconY); iconY += 12
    }
    if (gameState.upgrades.thrusterDamaged) { ctx.fillStyle = '#ff8800'; ctx.fillText('DMGD',  4, iconY); iconY += 12 }
    if (gameState.upgrades.shield > 0)      { ctx.fillStyle = '#44aaff'; ctx.fillText(`SH${gameState.upgrades.shield}/3`, 4, iconY); iconY += 12 }
    if (gameState.upgrades.navChip)         { ctx.fillStyle = '#44ff88'; ctx.fillText('NAV',   4, iconY); iconY += 12 }
    if (gameState.upgrades.cannonLevel > 0) {
      const ready = this.shootCooldown <= 0
      const hue = (Date.now() / 10) % 360
      ctx.fillStyle = ready ? `hsl(${hue}, 100%, 65%)` : '#556677'
      ctx.fillText(ready ? `GUN RDY` : `GUN ${Math.ceil(this.shootCooldown)}s`, 4, iconY)
    }

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

    if (this.pickupToastTimer > 0) {
      const alpha = Math.min(1, this.pickupToastTimer / 0.2)
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.textAlign = 'center'
      ctx.fillStyle = '#ffe58a'
      ctx.fillText(this.pickupToastText, GAME_WIDTH / 2, GAME_HEIGHT - 20)
      ctx.restore()
    }
  }

  private showPickupToast(text: string): void {
    this.pickupToastText = text
    this.pickupToastTimer = 1.2
  }

  private renderLives(ctx: CanvasRenderingContext2D): void {
    const charKey = gameState.playerSpriteKey
    const img = this.assets.getImage(charKey)
    const iconW = 10, iconH = 15
    const gap = 4
    const maxLives = 4
    const total = maxLives * iconW + (maxLives - 1) * gap
    const startX = Math.floor(GAME_WIDTH / 2 - total / 2)
    const blink = this.invincibilityTimer > 0 && Math.floor(Date.now() / 120) % 2 === 0

    for (let i = 0; i < maxLives; i++) {
      const x = startX + i * (iconW + gap)
      ctx.globalAlpha = i < gameState.lives ? (blink ? 0.3 : 1) : 0.2
      ctx.drawImage(img, 0, 0, 32, 48, x, 2, iconW, iconH)
    }
    ctx.globalAlpha = 1
  }
}
