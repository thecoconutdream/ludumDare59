import { Vector2 } from '@engine/physics/Vector2'
import { Camera } from '@engine/rendering/Camera'
import { GAME_WIDTH, GAME_HEIGHT } from '@engine/rendering/Renderer'

export type PickupType = 'hyperdrive' | 'shield'

export interface PickupData {
  pos: Vector2
  type: PickupType
  rotation: number
  pulseTimer: number
}

const COLLECT_RADIUS = 20

export class PickupSystem {
  private pickups: PickupData[] = []

  populate(origin: Vector2, hyperdriveCount: number, shieldCount: number, destination?: Vector2): void {
    const types: PickupType[] = [
      ...Array(hyperdriveCount).fill('hyperdrive'),
      ...Array(shieldCount).fill('shield'),
    ]
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]]
    }
    for (let i = 0; i < types.length; i++) {
      const t = (i + 0.5 + (Math.random() - 0.5) * 0.6) / types.length
      const base = destination ? origin.add(destination.sub(origin).scale(t)) : origin
      const routeAngle = destination ? Math.atan2(destination.y - origin.y, destination.x - origin.x) : 0
      const perpAngle = routeAngle + Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1)
      const spread = 80 + Math.random() * 150
      this.pickups.push({
        pos: base.add(new Vector2(Math.cos(perpAngle) * spread, Math.sin(perpAngle) * spread)),
        type: types[i],
        rotation: Math.random() * Math.PI * 2,
        pulseTimer: Math.random() * Math.PI * 2,
      })
    }
  }

  update(dt: number, shipPos: Vector2): void {
    for (const p of this.pickups) {
      p.rotation += dt * 1.2
      p.pulseTimer += dt * 3
    }
    this.pickups = this.pickups.filter(p => p.pos.distanceTo(shipPos) < 2500)
  }

  spawnShield(near: Vector2): void {
    const angle = Math.random() * Math.PI * 2
    const dist = 100 + Math.random() * 300
    this.pickups.push({
      pos: near.add(new Vector2(Math.cos(angle) * dist, Math.sin(angle) * dist)),
      type: 'shield',
      rotation: Math.random() * Math.PI * 2,
      pulseTimer: Math.random() * Math.PI * 2,
    })
  }

  checkCollection(shipPos: Vector2): PickupData | null {
    for (const p of this.pickups) {
      if (shipPos.distanceTo(p.pos) < COLLECT_RADIUS) return p
    }
    return null
  }

  remove(pickup: PickupData): void {
    this.pickups = this.pickups.filter(p => p !== pickup)
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    for (const p of this.pickups) {
      const s = camera.worldToScreen(p.pos)
      if (s.x < -30 || s.x > GAME_WIDTH + 30 || s.y < -30 || s.y > GAME_HEIGHT + 30) continue

      const pulse = 0.6 + Math.sin(p.pulseTimer) * 0.4

      ctx.save()
      ctx.translate(s.x, s.y)

      if (p.type === 'hyperdrive') {
        this.renderHyperdrive(ctx, p.rotation, pulse)
      } else {
        this.renderShield(ctx, pulse)
      }

      ctx.restore()
    }
  }

  private renderHyperdrive(ctx: CanvasRenderingContext2D, rotation: number, pulse: number): void {
    // Outer glow ring
    ctx.globalAlpha = pulse * 0.3
    ctx.strokeStyle = '#ffdd00'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(0, 0, 10, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1

    // Spinning star (4 points)
    ctx.rotate(rotation)
    ctx.fillStyle = '#ffdd00'
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2
      const r = 7 * pulse
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
      ctx.lineTo(Math.cos(a + 0.3) * r * 0.3, Math.sin(a + 0.3) * r * 0.3)
      ctx.closePath()
      ctx.fill()
    }

    // Center dot
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(0, 0, 2, 0, Math.PI * 2)
    ctx.fill()
  }

  private renderShield(ctx: CanvasRenderingContext2D, pulse: number): void {
    // Outer glow ring
    ctx.globalAlpha = pulse * 0.3
    ctx.strokeStyle = '#44aaff'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(0, 0, 10, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1

    // Diamond shape
    const r = 6 * pulse
    ctx.fillStyle = '#44aaff'
    ctx.beginPath()
    ctx.moveTo(0, -r)
    ctx.lineTo(r * 0.7, 0)
    ctx.lineTo(0, r)
    ctx.lineTo(-r * 0.7, 0)
    ctx.closePath()
    ctx.fill()

    // Inner highlight
    ctx.fillStyle = '#aaddff'
    ctx.beginPath()
    ctx.arc(0, 0, 2, 0, Math.PI * 2)
    ctx.fill()
  }
}
