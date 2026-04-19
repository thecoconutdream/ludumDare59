import { Camera } from '@engine/rendering/Camera'
import { InputManager } from '@engine/input/InputManager'
import { Vector2 } from '@engine/physics/Vector2'
import { AABB } from '@engine/physics/AABB'
import { gameState } from '@game/data/GameState'

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

export class Ship {
  pos = Vector2.zero()
  vel = Vector2.zero()
  angle = INITIAL_STATS.angle;
  turnSpeed = INITIAL_STATS.turnSpeed;
  acceleration = INITIAL_STATS.acceleration;
  brakeDeceleration = INITIAL_STATS.brakeDeceleration;

  private isAccelerating = false
  private particles: Particle[] = []
  private ignitionColors = ['#ff6600', '#ff8822', '#ffaa44', '#ff4400']
  private ignitionSpawnTimer = 0

  update(dt: number, input: InputManager, maxSpeed: number): void {
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

    this.pos = this.pos.add(this.vel.scale(dt))
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
    ctx.fillStyle = '#44ff88'
    ctx.beginPath()
    ctx.moveTo(12, 0)
    ctx.lineTo(-9, -6)
    ctx.lineTo(-6, 0)
    ctx.lineTo(-9, 6)
    ctx.closePath()
    ctx.fill()
    const flameThreshold = this.isAccelerating ? 0.5 : 0.7
    if (Math.random() > flameThreshold) {
      if (this.isAccelerating) {
        ctx.fillStyle = '#ff6600'
        ctx.fillRect(-11, -2, 4, 4)
      } else {
        ctx.fillStyle = '#66bbff'
        ctx.fillRect(-10, -1, 2, 2)
      }
    }
    ctx.restore()

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

  addIgnitionColor(color: string): void {
    this.ignitionColors.push(color)
  }

  setIgnitionColors(colors: string[]): void {
    this.ignitionColors = colors
  }
}
