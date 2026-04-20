import { Scene, SceneManager } from '@engine/core/SceneManager'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { AudioManager } from '@engine/audio/AudioManager'
import { GAME_WIDTH, GAME_HEIGHT } from '@engine/rendering/Renderer'
import { Vector2 } from '@engine/physics/Vector2'
import { FONT_SM, FONT_LG } from '@game/data/ui'
import { AABB } from '@engine/physics/AABB'
import { gameState } from '@game/data/GameState'
import { SpaceFlightScene } from '@game/scenes/SpaceFlightScene'
import { GameOverScene } from '@game/scenes/GameOverScene'

const ESCAPE_DISTANCE = 200
const COUNTDOWN_START = 12
const TURRET_COUNT = 4
const GRACE_PERIOD = 2.5

interface Turret {
  pos: Vector2
  angle: number
  fireTimer: number
  fireInterval: number
}

interface Projectile {
  pos: Vector2
  vel: Vector2
}

export class EscapeScene implements Scene {
  private shipPos = new Vector2(0, 0)
  private shipVel = new Vector2(0, 0)
  private countdown = COUNTDOWN_START
  private turrets: Turret[] = []
  private projectiles: Projectile[] = []
  private escaped = false
  private hit = false
  private resultTimer = 0
  private screenShake = 0
  private graceTimer = GRACE_PERIOD
  private invincibilityTimer = 0

  // Ship physics
  private readonly THRUST = 260
  private readonly DRAG = 0.98

  constructor(
    private scenes: SceneManager,
    private input: InputManager,
    private assets: AssetLoader,
    private audio: AudioManager,
  ) {}

  onEnter(): void {
    this.shipPos = new Vector2(0, 0)
    this.shipVel = new Vector2(0, 0)
    this.countdown = COUNTDOWN_START
    this.graceTimer = GRACE_PERIOD
    if (!this.audio.isPlaying('music_tense')) this.audio.play('music_tense')

    // Place turrets around origin in a circle
    for (let i = 0; i < TURRET_COUNT; i++) {
      const a = (i / TURRET_COUNT) * Math.PI * 2
      this.turrets.push({
        pos: new Vector2(Math.cos(a) * 90, Math.sin(a) * 90),
        angle: 0,
        fireTimer: i * 0.15,
        fireInterval: 2.5,
      })
    }
  }

  onExit(): void {
    this.audio.stop('turret_alarm')
  }

  update(dt: number): void {
    if (this.screenShake > 0) this.screenShake -= dt * 6
    if (this.invincibilityTimer > 0) this.invincibilityTimer -= dt

    if (this.hit || this.escaped) {
      this.resultTimer += dt
      if (this.resultTimer > 1.5) {
        if (this.hit) {
          this.scenes.replace(new GameOverScene(this.scenes, this.input, this.assets, this.audio))
        } else {
          this.scenes.replace(new SpaceFlightScene(this.scenes, this.input, this.assets, this.audio))
        }
      }
      return
    }

    // Grace period — turrets are shown but don't fire yet
    if (this.graceTimer > 0) this.graceTimer -= dt

    // Countdown
    this.countdown = Math.max(0, this.countdown - dt)
    const alarmActive = this.countdown < 3 && this.graceTimer <= 0
    if (alarmActive && !this.audio.isPlaying('turret_alarm')) this.audio.play('turret_alarm')
    else if (!alarmActive) this.audio.stop('turret_alarm')

    // Ship movement — locked during grace period
    const thrust = Vector2.zero()
    if (this.graceTimer <= 0) {
      if (this.input.isHeld('up'))    thrust.y -= 1
      if (this.input.isHeld('down'))  thrust.y += 1
      if (this.input.isHeld('left'))  thrust.x -= 1
      if (this.input.isHeld('right')) thrust.x += 1
    }

    if (thrust.magnitude() > 0) {
      const t = thrust.normalized().scale(this.THRUST * dt)
      this.shipVel = this.shipVel.add(t)
    }

    const maxSpeed = gameState.maxSpeed
    if (this.shipVel.magnitude() > maxSpeed) {
      this.shipVel = this.shipVel.normalized().scale(maxSpeed)
    }
    this.shipVel = this.shipVel.scale(this.DRAG)
    this.shipPos = this.shipPos.add(this.shipVel.scale(dt))

    // Turrets aim and fire
    const fiercer = this.countdown < 3
    if (this.graceTimer > 0) return
    for (const t of this.turrets) {
      t.angle = t.pos.angleTo(this.shipPos)
      t.fireTimer -= dt
      if (t.fireTimer <= 0) {
        t.fireTimer = fiercer ? 0.8 : t.fireInterval
        const dir = new Vector2(Math.cos(t.angle), Math.sin(t.angle))
        this.projectiles.push({
          pos: t.pos.clone(),
          vel: dir.scale(90),
        })
        this.audio.play('laser')
      }
    }

    // Move projectiles
    for (const p of this.projectiles) {
      p.pos = p.pos.add(p.vel.scale(dt))
    }
    this.projectiles = this.projectiles.filter(p =>
      Math.abs(p.pos.x) < 300 && Math.abs(p.pos.y) < 300,
    )

    // Hit detection
    const shipBounds = new AABB(this.shipPos.x - 6, this.shipPos.y - 5, 12, 10)
    if (this.invincibilityTimer <= 0) {
      for (const p of this.projectiles) {
        if (shipBounds.contains(p.pos)) {
          if (gameState.upgrades.shield > 0) {
            gameState.upgrades.shield--
            this.projectiles = this.projectiles.filter(q => q !== p)
            this.screenShake = 1
            this.audio.play('shield_hit')
          } else {
            gameState.lives--
            if (gameState.lives <= 0) {
              this.hit = true
              this.resultTimer = 0
              this.audio.play('hit')
              return
            }
            this.projectiles = this.projectiles.filter(q => q !== p)
            this.screenShake = 1
            this.invincibilityTimer = 2
            this.audio.play('hit')
          }
          break
        }
      }
    }

    // Escape check
    if (this.shipPos.distanceTo(Vector2.zero()) > ESCAPE_DISTANCE) {
      this.escaped = true
      this.resultTimer = 0
    }

    // Countdown ran out — max alert but no auto-gameover, player still has a moment
  }

  render(ctx: CanvasRenderingContext2D): void {
    const sx = this.screenShake > 0 ? Math.round((Math.random() - 0.5) * 4) : 0
    const sy = this.screenShake > 0 ? Math.round((Math.random() - 0.5) * 4) : 0

    ctx.save()
    ctx.translate(sx, sy)

    // Background
    const bgKey = `bg_client_surface_${gameState.clientVariant}`
    if (this.assets.hasImage(bgKey)) {
      ctx.drawImage(this.assets.getImage(bgKey), 0, 0)
    } else {
      ctx.fillStyle = '#200a0a'
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    }

    // Red alert overlay — flashes when countdown < 5
    if (this.countdown < 5 && Math.sin(Date.now() / 150) > 0) {
      ctx.fillStyle = '#ff000018'
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    }

    // World to screen: origin is center of canvas
    const cx = GAME_WIDTH / 2
    const cy = GAME_HEIGHT / 2

    const ws = (v: Vector2) => new Vector2(cx + v.x, cy + v.y)

    // Turrets
    for (const t of this.turrets) {
      const s = ws(t.pos)
      ctx.fillStyle = '#882222'
      ctx.fillRect(s.x - 5, s.y - 5, 10, 10)

      // Barrel
      ctx.strokeStyle = '#ff4444'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(s.x, s.y)
      ctx.lineTo(s.x + Math.cos(t.angle) * 10, s.y + Math.sin(t.angle) * 10)
      ctx.stroke()
    }

    // Projectiles
    ctx.fillStyle = '#ff8800'
    for (const p of this.projectiles) {
      const s = ws(p.pos)
      ctx.fillRect(s.x - 2, s.y - 1, 4, 2)
    }

    // Ship
    if (!this.hit) {
      const s = ws(this.shipPos)
      const angle = this.shipVel.magnitude() > 5
        ? Math.atan2(this.shipVel.y, this.shipVel.x)
        : 0
      const SHIP_W = 64, SHIP_H = 48
      const ANCHOR_X = 35, ANCHOR_Y = 32
      const PLAYER_W = 32, PLAYER_H = 48, PLAYER_SCALE = 0.5
      const dw = PLAYER_W * PLAYER_SCALE
      const dh = PLAYER_H * PLAYER_SCALE
      const dx = (ANCHOR_X - SHIP_W / 2) - dw / 2
      const dy = (ANCHOR_Y - SHIP_H / 2) - dh + 4
      const charKey = gameState.playerSpriteKey
      ctx.save()
      ctx.translate(s.x, s.y)
      ctx.rotate(angle)
      ctx.drawImage(this.assets.getImage('ship'), -SHIP_W / 2, -SHIP_H / 2)
      ctx.drawImage(this.assets.getImage(charKey), 8 * PLAYER_W, 0, PLAYER_W, PLAYER_H, dx, dy, dw, dh)
      ctx.restore()
    }

    // HUD
    ctx.restore()
    this.renderHUD(ctx)
  }

  private renderHUD(ctx: CanvasRenderingContext2D): void {
    ctx.textAlign = 'center'

    // Countdown
    const secs = Math.ceil(this.countdown)
    const urgent = secs <= 3
    ctx.fillStyle = urgent ? '#ff2222' : '#ff8800'
    ctx.font = urgent ? FONT_LG : FONT_SM
    ctx.fillText(`${secs}`, GAME_WIDTH / 2, 16)

    ctx.fillStyle = '#aaaacc'
    ctx.font = FONT_SM
    if (this.graceTimer > 0) {
      ctx.fillStyle = '#ffcc00'
      ctx.fillText(`TURRETS ONLINE IN ${Math.ceil(this.graceTimer)}...`, GAME_WIDTH / 2, 28)
    } else {
      ctx.fillText('ESCAPE NOW!', GAME_WIDTH / 2, 28)
    }

    if (this.escaped) {
      ctx.fillStyle = '#44ff88'
      ctx.font = FONT_SM
      ctx.fillText('ESCAPED!', GAME_WIDTH / 2, GAME_HEIGHT / 2)
      ctx.fillStyle = '#aaffcc'
      ctx.fillText('New address incoming...', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 14)
    }

    if (this.hit) {
      ctx.fillStyle = '#ff4444'
      ctx.font = FONT_SM
      ctx.fillText('DIRECT HIT!', GAME_WIDTH / 2, GAME_HEIGHT / 2)
    }

    this.renderLives(ctx)
  }

  private renderLives(ctx: CanvasRenderingContext2D): void {
    const blink = this.invincibilityTimer > 0 && Math.floor(Date.now() / 120) % 2 === 0
    const size = 6, gap = 4
    const maxLives = 4
    const total = maxLives * size + (maxLives - 1) * gap
    const startX = Math.floor(GAME_WIDTH / 2 - total / 2)
    for (let i = 0; i < maxLives; i++) {
      const alive = i < gameState.lives
      ctx.fillStyle = alive ? (blink ? '#ff444488' : '#ff4444') : '#332222'
      ctx.fillRect(startX + i * (size + gap), 36, size, size)
    }
  }
}
