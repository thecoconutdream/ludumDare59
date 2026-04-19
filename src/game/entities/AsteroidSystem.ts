import { Vector2 } from '@engine/physics/Vector2'
import { AABB } from '@engine/physics/AABB'
import { Camera } from '@engine/rendering/Camera'
import { AssetLoader } from '@engine/assets/AssetLoader'
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
  asteroid_large_1: 14, asteroid_large_2: 14,
  asteroid_huge: 16,
}

// Weighted: smalls appear often, huge ones rarely
const VARIANT_POOL = [
  'asteroid_small_1', 'asteroid_small_2', 'asteroid_small_3',
  'asteroid_small_1', 'asteroid_small_2',
  'asteroid_medium_1', 'asteroid_medium_2', 'asteroid_medium_3',
  'asteroid_medium_1', 'asteroid_medium_2',
  'asteroid_large_1', 'asteroid_large_2',
  'asteroid_huge',
]

export class AsteroidSystem {
  private asteroids: AsteroidData[] = []

  update(dt: number, shipPos: Vector2): void {
    for (const a of this.asteroids) {
      a.pos = a.pos.add(a.vel.scale(dt))
      a.rotation += a.rotSpeed * dt
    }
    this.asteroids = this.asteroids.filter(a => a.pos.distanceTo(shipPos) < 900)
  }

  populate(origin: Vector2, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.8
      const dist = 280 + Math.random() * 350
      const variantKey = VARIANT_POOL[Math.floor(Math.random() * VARIANT_POOL.length)]
      // Bias velocity outward so asteroids don't drift into the player immediately
      const outward = new Vector2(Math.cos(angle), Math.sin(angle)).scale(8 + Math.random() * 10)
      const drift = new Vector2((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20)
      this.asteroids.push({
        pos: origin.add(new Vector2(Math.cos(angle) * dist, Math.sin(angle) * dist)),
        vel: outward.add(drift),
        radius: VARIANT_RADII[variantKey],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 2,
        variantKey,
      })
    }
  }

  spawn(shipPos: Vector2, shipAngle: number): void {
    const count = Math.random() < 0.4 ? 3 : 1
    for (let i = 0; i < count; i++) {
      const spawnAngle = shipAngle + (Math.random() - 0.5) * Math.PI * 1.4
      const spawnDist = 180 + Math.random() * 80
      const variantKey = VARIANT_POOL[Math.floor(Math.random() * VARIANT_POOL.length)]
      this.asteroids.push({
        pos: shipPos.add(new Vector2(Math.cos(spawnAngle) * spawnDist, Math.sin(spawnAngle) * spawnDist)),
        vel: new Vector2((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40),
        radius: VARIANT_RADII[variantKey],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 2,
        variantKey,
      })
    }
  }

  checkCollision(bounds: AABB): AsteroidData | null {
    const shipCenter = bounds.center
    const shipRadius = Math.min(bounds.width, bounds.height) / 2
    for (const a of this.asteroids) {
      if (shipCenter.distanceTo(a.pos) < a.radius + shipRadius) return a
    }
    return null
  }

  remove(asteroid: AsteroidData): void {
    this.asteroids = this.asteroids.filter(a => a !== asteroid)
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera, assets: AssetLoader): void {
    for (const a of this.asteroids) {
      const s = camera.worldToScreen(a.pos)
      if (s.x < -100 || s.x > GAME_WIDTH + 100 || s.y < -100 || s.y > GAME_HEIGHT + 100) continue

      const img = assets.getImage(a.variantKey)
      const hw = img.width / 2
      const hh = img.height / 2

      ctx.save()
      ctx.translate(s.x, s.y)
      ctx.rotate(a.rotation)
      ctx.drawImage(img, -hw, -hh)
      ctx.restore()
    }
  }
}
