import { Vector2 } from '@engine/physics/Vector2'
import { Camera } from '@engine/rendering/Camera'
import { GAME_WIDTH, GAME_HEIGHT } from '@engine/rendering/Renderer'
import { Biome, Loot } from '@game/data/GameState'
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

  render(ctx: CanvasRenderingContext2D, camera: Camera, visited: boolean): void {
    const s = camera.worldToScreen(this.pos)
    if (s.x < -60 || s.x > GAME_WIDTH + 60 || s.y < -60 || s.y > GAME_HEIGHT + 60) return

    ctx.save()
    ctx.beginPath()
    ctx.arc(s.x, s.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = this.color + (visited ? '55' : 'bb')
    ctx.fill()
    ctx.strokeStyle = this.color
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.restore()

    if (this.type !== 'dead') {
      ctx.fillStyle = this.type === 'client' ? '#ffcc00' : '#aaaacc'
      ctx.font = FONT_SM
      ctx.textAlign = 'center'
      ctx.fillText(this.label, s.x, s.y + this.radius + 8)
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
    const seed = deliveryCount * 1337
    const angle = rng(seed) * Math.PI * 2
    const dist = 1800 + rng(seed * 1.7) * 600
    const clientPos = new Vector2(Math.cos(angle) * dist, Math.sin(angle) * dist)
    const biomes: Biome[] = ['ice', 'jungle', 'desert', 'lava']
    const loots: Loot[] = ['outfit', 'upgrade', 'empty', 'empty']

    const planets: Planet[] = [
      new Planet('home', Vector2.zero(), 'home', 30, PLANET_COLORS.home, 'COSMIC PIZZA', 0),
      new Planet('client', clientPos, 'client', 28, PLANET_COLORS.client, 'DELIVERY TARGET', (deliveryCount % 3) + 1),
    ]

    for (let i = 0; i < 4; i++) {
      const t = (i + 1) / 5
      const base = clientPos.scale(t)
      const perpAngle = angle + Math.PI / 2 + rng(seed + i * 77) * Math.PI
      const offset = 250 + rng(seed + i * 200) * 200
      const biome = biomes[i % 4]
      planets.push(new Planet(
        `side_${i}`,
        base.add(new Vector2(Math.cos(perpAngle) * offset, Math.sin(perpAngle) * offset)),
        'side', 20, BIOME_COLORS[biome], biome.toUpperCase(), (i % 2) + 1,
        biome, loots[i % 4],
      ))
    }

    for (let i = 0; i < 3; i++) {
      const t = (i + 1) / 4
      const base = clientPos.scale(t)
      const a = angle + Math.PI / 2 * (i % 2 === 0 ? 1 : -1) + rng(seed + i * 500) * 0.5
      planets.push(new Planet(
        `dead_${i}`,
        base.add(new Vector2(Math.cos(a) * (150 + i * 80), Math.sin(a) * (150 + i * 80))),
        'dead', 14, PLANET_COLORS.dead, '', (i % 3) + 1,
      ))
    }

    return planets
  }
}
