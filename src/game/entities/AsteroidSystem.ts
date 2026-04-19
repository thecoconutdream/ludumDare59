import { Vector2 } from '@engine/physics/Vector2'
import { AABB } from '@engine/physics/AABB'
import { Camera } from '@engine/rendering/Camera'
import { GAME_WIDTH, GAME_HEIGHT } from '@engine/rendering/Renderer'

export interface AsteroidData {
  pos: Vector2
  vel: Vector2
  radius: number
  rotation: number
  rotSpeed: number
  variantKey: string
}

const VARIANT_RADII: Record<string, number> = {
  asteroid_small_1: 4, asteroid_small_2: 4, asteroid_small_3: 4,
  asteroid_medium_1: 8, asteroid_medium_2: 8, asteroid_medium_3: 8,
  asteroid_large_1: 12, asteroid_large_2: 12,
}

const VARIANTS = Object.keys(VARIANT_RADII)

export class AsteroidSystem {
  private asteroids: AsteroidData[] = []

  update(dt: number, shipPos: Vector2): void {
    for (const a of this.asteroids) {
      a.pos = a.pos.add(a.vel.scale(dt))
      a.rotation += a.rotSpeed * dt
    }
    this.asteroids = this.asteroids.filter(a => a.pos.distanceTo(shipPos) < 500)
  }

  spawn(shipPos: Vector2, shipAngle: number): void {
    const spawnAngle = shipAngle + (Math.random() - 0.5) * Math.PI * 1.2
    const spawnDist = 180 + Math.random() * 60
    const variantKey = VARIANTS[Math.floor(Math.random() * VARIANTS.length)]
    this.asteroids.push({
      pos: shipPos.add(new Vector2(Math.cos(spawnAngle) * spawnDist, Math.sin(spawnAngle) * spawnDist)),
      vel: new Vector2((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40),
      radius: VARIANT_RADII[variantKey],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 2,
      variantKey,
    })
  }

  checkCollision(bounds: AABB): AsteroidData | null {
    for (const a of this.asteroids) {
      const ab = new AABB(a.pos.x - a.radius, a.pos.y - a.radius, a.radius * 2, a.radius * 2)
      if (bounds.intersects(ab)) return a
    }
    return null
  }

  remove(asteroid: AsteroidData): void {
    this.asteroids = this.asteroids.filter(a => a !== asteroid)
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    for (const a of this.asteroids) {
      const s = camera.worldToScreen(a.pos)
      if (s.x < -50 || s.x > GAME_WIDTH + 50 || s.y < -50 || s.y > GAME_HEIGHT + 50) continue

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
  }
}
