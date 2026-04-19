import { Camera } from '@engine/rendering/Camera'
import { Vector2 } from '@engine/physics/Vector2'
import { GameObject } from '@game/entities/GameObject'

interface Particle {
  pos: Vector2
  vel: Vector2
  lifetime: number
  maxLifetime: number
  color: string
}

export interface ParticleEmitterConfig {
  colors: string[]
  spawnRate?: number
  speedMin?: number
  speedMax?: number
  lifetimeMin?: number
  lifetimeMax?: number
  spreadAngle?: number
}

export class ParticleEmitter extends GameObject {
  private particles: Particle[] = []
  private colors: string[]
  private spawnRate: number
  private spawnTimer = 0
  private speedMin: number
  private speedMax: number
  private lifetimeMin: number
  private lifetimeMax: number
  private spreadAngle: number
  private isEmitting = false

  constructor(config: ParticleEmitterConfig) {
    super()
    this.colors = config.colors
    this.spawnRate = config.spawnRate ?? 2
    this.speedMin = config.speedMin ?? 30
    this.speedMax = config.speedMax ?? 70
    this.lifetimeMin = config.lifetimeMin ?? 0.3
    this.lifetimeMax = config.lifetimeMax ?? 0.5
    this.spreadAngle = config.spreadAngle ?? 0.6
  }

  setEmitting(emitting: boolean): void {
    this.isEmitting = emitting
  }

  setColors(colors: string[]): void {
    this.colors = colors
  }

  update(dt: number): void {
    if (this.isEmitting) {
      this.spawnTimer += 1
      if (this.spawnTimer >= this.spawnRate) {
        this.spawnTimer = 0
        this.emit()
      }
    }

    this.updateParticles(dt)
  }

  private emit(): void {
    const backward = new Vector2(Math.cos(this.angle + Math.PI), Math.sin(this.angle + Math.PI))
    const spreadAngleRad = (Math.random() - 0.5) * this.spreadAngle
    const cos = Math.cos(spreadAngleRad)
    const sin = Math.sin(spreadAngleRad)
    const direction = new Vector2(
      backward.x * cos - backward.y * sin,
      backward.x * sin + backward.y * cos
    )

    const speed = this.speedMin + Math.random() * (this.speedMax - this.speedMin)

    this.particles.push({
      pos: this.pos.clone(),
      vel: direction.scale(speed),
      lifetime: 0,
      maxLifetime: this.lifetimeMin + Math.random() * (this.lifetimeMax - this.lifetimeMin),
      color: this.colors[Math.floor(Math.random() * this.colors.length)]
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
    for (const p of this.particles) {
      const s = camera.worldToScreen(p.pos)
      const alpha = 1 - (p.lifetime / p.maxLifetime)
      ctx.fillStyle = this.hexToRgba(p.color, alpha)
      ctx.beginPath()
      ctx.arc(s.x, s.y, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}
