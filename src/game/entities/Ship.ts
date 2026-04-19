import { Camera } from '@engine/rendering/Camera'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { AnimationPlayer } from '@engine/rendering/AnimationPlayer'
import { Vector2 } from '@engine/physics/Vector2'
import { AABB } from '@engine/physics/AABB'
import { gameState } from '@game/data/GameState'
import { PlayerAnims } from '@game/data/animations'

const INITIAL_STATS = {
  angle: 0,
  turnSpeed: 4.5,
  acceleration: 220,
  brakeDeceleration: 32
}

interface Particle {
  pos: Vector2
  vel: Vector2
  lifetime: number
  maxLifetime: number
  color: string
}

// Ship sprite: 64×48px. Colored anchor line at y=32, x-center=32.
const SHIP_W = 64, SHIP_H = 48
const ANCHOR_X = 35, ANCHOR_Y = 32

// Player drawn at 50% scale (32×48 → 16×24)
const PLAYER_W = 32, PLAYER_H = 48
const PLAYER_SCALE = 0.5

export class Ship {
  pos = Vector2.zero()
  vel = Vector2.zero()
  angle = INITIAL_STATS.angle
  turnSpeed = INITIAL_STATS.turnSpeed
  acceleration = INITIAL_STATS.acceleration
  brakeDeceleration = INITIAL_STATS.brakeDeceleration

  private isAccelerating = false
  private particles: Particle[] = []
  private ignitionColors = ['#ff6600', '#ff8822', '#ffaa44', '#ff4400']
  private readonly rainbowColors = ['#ff0000', '#ff8800', '#ffff00', '#00ff88', '#0088ff', '#aa00ff', '#ff00aa']
  private ignitionSpawnTimer = 0
  private anim = new AnimationPlayer()
  private state: 'fly' | 'hit' = 'fly'
  private assets: AssetLoader
  hyperdriveTimer = 0
  private readonly BASE_ACCELERATION = INITIAL_STATS.acceleration

  constructor(assets: AssetLoader) {
    this.assets = assets
    this.anim.play(PlayerAnims.fly)
  }

  triggerHit(): void {
    this.state = 'hit'
    this.anim.play(PlayerAnims.hit)
  }

  resetState(): void {
    this.state = 'fly'
    this.vel = Vector2.zero()
    this.anim.play(PlayerAnims.fly)
  }

  activateHyperdrive(): void {
    this.acceleration = this.BASE_ACCELERATION * 2.2
    this.brakeDeceleration *= 2.5
    this.ignitionColors = [...this.rainbowColors]
  }

  update(dt: number, input: InputManager, maxSpeed: number): void {
    if (this.state === 'fly') {
      if (input.isHeld('left'))  this.angle -= this.turnSpeed * dt
      if (input.isHeld('right')) this.angle += this.turnSpeed * dt

      this.isAccelerating = input.isHeld('up')
      if (this.isAccelerating) {
        const forward = new Vector2(Math.cos(this.angle), Math.sin(this.angle))
        this.vel = this.vel.add(forward.scale(this.acceleration * dt))
        this.spawnIgnitionParticles()
      }

      if (input.isHeld('down')) {
        const speed = this.vel.magnitude()
        if (speed > 0.001) {
          const brakeStep = this.brakeDeceleration * dt
          this.vel = brakeStep >= speed
            ? Vector2.zero()
            : this.vel.add(this.vel.normalized().scale(-brakeStep))
        }
      }

      if (this.vel.magnitude() > maxSpeed) {
        this.vel = this.vel.normalized().scale(maxSpeed)
      }
    }

    this.pos = this.pos.add(this.vel.scale(dt))
    this.anim.update(dt)
    this.updateParticles(dt)
  }

  private spawnIgnitionParticles(): void {
    this.ignitionSpawnTimer += 1
    if (this.ignitionSpawnTimer < 2) return
    this.ignitionSpawnTimer = 0

    // Spawn particle behind ship
    const backward = new Vector2(Math.cos(this.angle + Math.PI), Math.sin(this.angle + Math.PI))
    const spawnPos = this.pos.add(backward.scale(8))

    // Spread angle for particle variation
    const spreadAngle = (Math.random() - 0.5) * 0.6
    const cos = Math.cos(spreadAngle)
    const sin = Math.sin(spreadAngle)
    const particleDir = new Vector2(
      backward.x * cos - backward.y * sin,
      backward.x * sin + backward.y * cos
    )

    this.particles.push({
      pos: spawnPos,
      vel: particleDir.scale(30 + Math.random() * 40),
      lifetime: 0,
      maxLifetime: 0.3 + Math.random() * 0.2,
      color: this.ignitionColors[Math.floor(Math.random() * this.ignitionColors.length)]
    })
  }

  private updateParticles(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.lifetime += dt
      p.pos = p.pos.add(p.vel.scale(dt))

      if (p.lifetime >= p.maxLifetime) {
        this.particles.splice(i, 1)
      }
    }
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    // Render particles first (behind ship)
    for (const p of this.particles) {
      const s = camera.worldToScreen(p.pos)
      const alpha = 1 - (p.lifetime / p.maxLifetime)
      ctx.fillStyle = this.hexToRgba(p.color, alpha)
      ctx.beginPath()
      ctx.arc(s.x, s.y, 2, 0, Math.PI * 2)
      ctx.fill()
    }

    const s = camera.worldToScreen(this.pos)

    ctx.save()
    ctx.translate(s.x, s.y)
    ctx.rotate(this.angle)

    ctx.drawImage(this.assets.getImage('ship'), -SHIP_W / 2, -SHIP_H / 2)

    const charKey = gameState.character === 'cat' ? 'player_cat' : 'player_dog'
    const dw = PLAYER_W * PLAYER_SCALE
    const dh = PLAYER_H * PLAYER_SCALE
    const dx = (ANCHOR_X - SHIP_W / 2) - dw / 2
    const dy = (ANCHOR_Y - SHIP_H / 2) - dh + 4
    ctx.drawImage(this.assets.getImage(charKey), this.anim.currentFrame * PLAYER_W, 0, PLAYER_W, PLAYER_H, dx, dy, dw, dh)

    ctx.restore()

    if (this.state === 'fly' && this.isAccelerating && Math.random() > 0.4) {
      ctx.save()
      ctx.translate(s.x, s.y)
      ctx.rotate(this.angle)
      ctx.fillStyle = '#ff6600'
      ctx.fillRect(-SHIP_W / 2 - 8, -3, 8, 6)
      ctx.restore()
    }

    if (gameState.upgrades.shield) {
      ctx.strokeStyle = `rgba(68,170,255,${0.4 + Math.sin(Date.now() / 200) * 0.2})`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(s.x, s.y, 36, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  get bounds(): AABB {
    return new AABB(this.pos.x - 24, this.pos.y - 16, 48, 32)
  }

  addIgnitionColor(color: string): void {
    this.ignitionColors.push(color)
  }

  setIgnitionColors(colors: string[]): void {
    this.ignitionColors = colors
  }
}
