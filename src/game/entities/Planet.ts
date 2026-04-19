import { Vector2 } from '@engine/physics/Vector2'
import { Camera } from '@engine/rendering/Camera'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { GAME_WIDTH, GAME_HEIGHT } from '@engine/rendering/Renderer'
import { Biome, Loot, gameState } from '@game/data/GameState'
import { rng } from '@game/data/rng'
import { FONT_SM } from '@game/data/ui'

export type PlanetType = 'home' | 'client' | 'side' | 'dead'

const PLANET_COLORS: Record<PlanetType, string> = {
  home:   '#ff8833',
  client: '#aa44ff',
  side:   '#44aaff',
  dead:   '#555566',
}

const BIOME_COLORS: Record<string, string> = {
  ice: '#aaddff', jungle: '#44aa44', desert: '#ddaa44', lava: '#ff4400',
}

export class Planet {
  constructor(
    public readonly id: string,
    public readonly pos: Vector2,
    public readonly type: PlanetType,
    public readonly radius: number,
    public readonly color: string,
    public readonly label: string,
    public readonly variant: number,
    public readonly biome?: Biome,
    public readonly loot?: Loot,
  ) {}

  isNearby(shipPos: Vector2): boolean {
    return shipPos.distanceTo(this.pos) < this.radius + 25
  }

  private assetKey(): string {
    if (this.type === 'home')   return 'planet_home'
    if (this.type === 'client') return `planet_client_${this.variant}`
    if (this.type === 'side')   return `planet_side_${this.biome}_${this.variant}`
    return `planet_side_dead_${this.variant}`
  }

  private spriteSize(): number {
    if (this.type === 'home' || this.type === 'client') return 48
    return 40
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera, assets: AssetLoader, visited: boolean): void {
    const s = camera.worldToScreen(this.pos)
    if (s.x < -60 || s.x > GAME_WIDTH + 60 || s.y < -60 || s.y > GAME_HEIGHT + 60) return

    const size = this.spriteSize()
    const half = size / 2

    ctx.save()
    if (visited) ctx.globalAlpha = 0.5
    ctx.drawImage(assets.getImage(this.assetKey()), s.x - half, s.y - half)
    ctx.restore()

    if (this.type !== 'dead') {
      ctx.fillStyle = this.type === 'client' ? '#ffcc00' : '#aaaacc'
      ctx.font = FONT_SM
      ctx.textAlign = 'center'
      ctx.fillText(this.label, s.x, s.y + half + 8)
    }
  }

  renderProximityRing(ctx: CanvasRenderingContext2D, camera: Camera, shipPos: Vector2): void {
    const s = camera.worldToScreen(this.pos)
    const dist = shipPos.distanceTo(this.pos)
    const threshold = this.radius + 25
    const alpha = Math.max(0, 1 - dist / (threshold * 3))
    ctx.strokeStyle = `rgba(255,204,0,${alpha})`
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.arc(s.x, s.y, threshold, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
  }

  static generateRoute(deliveryCount: number): Planet[] {
    const s = gameState.gameSeed
    const angle = Math.random() * Math.PI * 2
    const dist = 1800 + Math.random() * 600
    const clientPos = new Vector2(Math.cos(angle) * dist, Math.sin(angle) * dist)
    const biomes: Biome[] = ['ice', 'jungle', 'desert', 'lava']
    const loots: Loot[] = ['outfit', 'upgrade', 'empty', 'outfit', 'empty', 'empty']

    const planets: Planet[] = [
      new Planet('home', Vector2.zero(), 'home', 30, PLANET_COLORS.home, 'COSMIC PIZZA', 0),
      new Planet('client', clientPos, 'client', 28, PLANET_COLORS.client, 'DELIVERY TARGET', (deliveryCount % 3) + 1),
    ]

    // Side and dead planets: along the route, perpendicular offset seeded per game
    for (let i = 0; i < 6; i++) {
      const t = (i + 1) / 7
      const base = clientPos.scale(t)
      const perpAngle = angle + Math.PI / 2 + (rng(s + i * 77) > 0.5 ? 0 : Math.PI)
      const offset = 60 + rng(s + i * 200) * 80
      const biome = biomes[i % 4]
      planets.push(new Planet(
        `side_${i}`,
        base.add(new Vector2(Math.cos(perpAngle) * offset, Math.sin(perpAngle) * offset)),
        'side', 20, BIOME_COLORS[biome], biome.toUpperCase(), (i % 2) + 1,
        biome, loots[i % 4],
      ))
    }

    for (let i = 0; i < 5; i++) {
      const t = (i + 1) / 6
      const base = clientPos.scale(t)
      const perpAngle = angle + Math.PI / 2 * (rng(s + i * 500 + 1000) > 0.5 ? 1 : -1)
      const offset = 50 + rng(s + i * 300 + 2000) * 60
      planets.push(new Planet(
        `dead_${i}`,
        base.add(new Vector2(Math.cos(perpAngle) * offset, Math.sin(perpAngle) * offset)),
        'dead', 14, PLANET_COLORS.dead, '', (i % 2) + 1,
      ))
    }

    return planets
  }
}
