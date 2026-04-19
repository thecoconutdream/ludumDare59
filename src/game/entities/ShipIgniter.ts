import { Camera } from '@engine/rendering/Camera'
import { Vector2 } from '@engine/physics/Vector2'
import { GameObject, Anchor } from '@game/entities/GameObject'
import { ParticleEmitter } from '@game/entities/ParticleEmitter'

const SHIP_W = 64

export class ShipIgniter extends GameObject {
  private particleEmitter: ParticleEmitter
  private readonly rainbowColors = ['#ff0000', '#ff8800', '#ffff00', '#00ff88', '#0088ff', '#aa00ff', '#ff00aa']
  private ignitionColors = ['#ff6600', '#ff8822', '#ffaa44', '#ff4400']
  private isAccelerating = false

  constructor() {
    super()

    // Create and attach particle emitter
    this.particleEmitter = new ParticleEmitter({
      colors: this.ignitionColors,
      spawnRate: 2,
      speedMin: 30,
      speedMax: 70,
      lifetimeMin: 0.3,
      lifetimeMax: 0.5,
      spreadAngle: 0.6
    })

    // Position emitter at rear of ship
    const emitterAnchor: Anchor = { localPos: new Vector2(-SHIP_W / 2 - 4, 0) }
    this.addChild(this.particleEmitter, emitterAnchor)
  }

  activateHyperdrive(): void {
    this.ignitionColors = [...this.rainbowColors]
    this.particleEmitter.setColors(this.ignitionColors)
  }

  resetColors(): void {
    this.ignitionColors = ['#ff6600', '#ff8822', '#ffaa44', '#ff4400']
    this.particleEmitter.setColors(this.ignitionColors)
  }

  setAccelerating(accelerating: boolean): void {
    this.isAccelerating = accelerating
    this.particleEmitter.setEmitting(accelerating)
  }

  addIgnitionColor(color: string): void {
    this.ignitionColors.push(color)
    this.particleEmitter.setColors(this.ignitionColors)
  }

  setIgnitionColors(colors: string[]): void {
    this.ignitionColors = colors
    this.particleEmitter.setColors(colors)
  }

  update(dt: number): void {
    this.updateChildren(dt)
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    // Render children (particle emitter)
    this.renderChildren(ctx, camera)

    // Render ignition flame
    if (this.isAccelerating && Math.random() > 0.4) {
      const s = camera.worldToScreen(this.pos)
      ctx.save()
      ctx.translate(s.x, s.y)
      ctx.rotate(this.angle)
      ctx.fillStyle = '#ff6600'
      ctx.fillRect(-SHIP_W / 2 - 8, 0, 8, 6)
      ctx.restore()
    }
  }
}
