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

interface OrbitingAsteroid {
  center: Vector2
  orbitAngle: number
  orbitRadius: number
  angularSpeed: number
  rotation: number
  rotSpeed: number
  radius: number
  variantKey: string
  // computed each frame, used for collision/render
  pos: Vector2
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

const ORBIT_VARIANTS = [
  'asteroid_small_1', 'asteroid_small_2', 'asteroid_small_3',
  'asteroid_medium_1', 'asteroid_medium_2',
]

export class AsteroidSystem {
  private asteroids: AsteroidData[] = []
  private orbiting: OrbitingAsteroid[] = []

  clear(): void { this.asteroids = []; this.orbiting = [] }

  update(dt: number, shipPos: Vector2): void {
    for (const a of this.asteroids) {
      a.pos = a.pos.add(a.vel.scale(dt))
      a.rotation += a.rotSpeed * dt
    }
    this.asteroids = this.asteroids.filter(a => a.pos.distanceTo(shipPos) < 900)

    for (const o of this.orbiting) {
      o.orbitAngle += o.angularSpeed * dt
      o.rotation += o.rotSpeed * dt
      o.pos = o.center.add(new Vector2(
        Math.cos(o.orbitAngle) * o.orbitRadius,
        Math.sin(o.orbitAngle) * o.orbitRadius,
      ))
    }
  }

  populate(origin: Vector2, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.8
      const dist = 280 + Math.random() * 350
      const variantKey = VARIANT_POOL[Math.floor(Math.random() * VARIANT_POOL.length)]
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

  populateInBounds(planetPositions: Vector2[], safeOrigin: Vector2, safeRadius: number, count: number): void {
    if (planetPositions.length === 0) return
    const pad = 250
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const p of planetPositions) {
      if (p.x < minX) minX = p.x
      if (p.y < minY) minY = p.y
      if (p.x > maxX) maxX = p.x
      if (p.y > maxY) maxY = p.y
    }
    minX -= pad; minY -= pad; maxX += pad; maxY += pad
    let placed = 0
    let attempts = 0
    while (placed < count && attempts < count * 5) {
      attempts++
      const pos = new Vector2(
        minX + Math.random() * (maxX - minX),
        minY + Math.random() * (maxY - minY),
      )
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
      placed++
    }
  }

  populateOrbiting(planetPositions: Vector2[]): void {
    for (const center of planetPositions) {
      const count = 1 + Math.floor(Math.random() * 2)
      for (let i = 0; i < count; i++) {
        const variantKey = ORBIT_VARIANTS[Math.floor(Math.random() * ORBIT_VARIANTS.length)]
        const orbitRadius = 55 + Math.random() * 50
        const orbitAngle = Math.random() * Math.PI * 2
        const angularSpeed = (0.3 + Math.random() * 0.4) * (Math.random() < 0.5 ? 1 : -1)
        const o: OrbitingAsteroid = {
          center,
          orbitAngle,
          orbitRadius,
          angularSpeed,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 3,
          radius: VARIANT_RADII[variantKey],
          variantKey,
          pos: Vector2.zero(),
        }
        o.pos = center.add(new Vector2(Math.cos(orbitAngle) * orbitRadius, Math.sin(orbitAngle) * orbitRadius))
        this.orbiting.push(o)
      }
    }
  }

  spawn(shipPos: Vector2, shipAngle: number): void {
    if (this.asteroids.length >= 60) return
    {
      const spawnAngle = shipAngle + (Math.random() - 0.5) * Math.PI * 1.4
      const spawnDist = 290 + Math.random() * 80
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

  checkBulletHit(pos: Vector2): AsteroidData | OrbitingAsteroid | null {
    for (const a of this.asteroids) {
      if (pos.distanceTo(a.pos) < a.radius) return a
    }
    for (const o of this.orbiting) {
      if (pos.distanceTo(o.pos) < o.radius) return o
    }
    return null
  }

  checkCollision(bounds: AABB): AsteroidData | OrbitingAsteroid | null {
    const shipCenter = bounds.center
    const shipRadius = Math.min(bounds.width, bounds.height) / 2
    for (const a of this.asteroids) {
      if (shipCenter.distanceTo(a.pos) < a.radius + shipRadius) return a
    }
    for (const o of this.orbiting) {
      if (shipCenter.distanceTo(o.pos) < o.radius + shipRadius) return o
    }
    return null
  }

  remove(asteroid: AsteroidData | OrbitingAsteroid): void {
    this.asteroids = this.asteroids.filter(a => a !== asteroid)
    this.orbiting = this.orbiting.filter(o => o !== asteroid)
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera, assets: AssetLoader): void {
    const all = [...this.asteroids, ...this.orbiting]
    for (const a of all) {
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
