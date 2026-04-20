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

const SPRITE_SCALE = 2

const VARIANT_RADII: Record<string, number> = {
  asteroid_small_1: 8, asteroid_small_2: 8, asteroid_small_3: 8,
  asteroid_medium_1: 16, asteroid_medium_2: 16, asteroid_medium_3: 16,
  asteroid_large_1: 24, asteroid_large_2: 24,
  asteroid_huge: 32,
  junk_satellite: 12, junk_panel: 12, junk_canister: 12,
}

// Weighted: smalls appear often, huge ones rarely, junk occasionally
const VARIANT_POOL = [
  'asteroid_small_1', 'asteroid_small_2', 'asteroid_small_3',
  'asteroid_small_1', 'asteroid_small_2',
  'asteroid_medium_1', 'asteroid_medium_2', 'asteroid_medium_3',
  'asteroid_medium_1', 'asteroid_medium_2',
  'asteroid_large_1', 'asteroid_large_2',
  'asteroid_huge',
  'junk_satellite', 'junk_panel', 'junk_canister',
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

  populateAroundHotspots(hotspots: Vector2[], safeOrigin: Vector2, safeRadius: number, countPerHotspot: number): void {
    for (const hotspot of hotspots) {
      for (let i = 0; i < countPerHotspot; i++) {
        const angle = Math.random() * Math.PI * 2
        const dist = 55 + Math.random() * 140
        const pos = hotspot.add(new Vector2(Math.cos(angle) * dist, Math.sin(angle) * dist))
        if (pos.distanceTo(safeOrigin) < safeRadius) continue
        const variantKey = VARIANT_POOL[Math.floor(Math.random() * VARIANT_POOL.length)]
        this.asteroids.push({
          pos,
          vel: new Vector2((Math.random() - 0.5) * 28, (Math.random() - 0.5) * 28),
          radius: VARIANT_RADII[variantKey],
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 2,
          variantKey,
        })
      }
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
      const dw = img.width * SPRITE_SCALE
      const dh = img.height * SPRITE_SCALE

      ctx.save()
      ctx.translate(s.x, s.y)
      ctx.rotate(a.rotation)
      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh)
      ctx.restore()
    }
  }
}
