import { GAME_WIDTH, GAME_HEIGHT } from '@engine/rendering/Renderer'
import { rng } from '@game/data/rng'

export class StarLayer {
  private readonly stars: Array<{ x: number; y: number; size: number }>

  constructor(count: number, seed: number) {
    this.stars = Array.from({ length: count }, (_, i) => ({
      x: rng(seed + i * 127.1) * GAME_WIDTH,
      y: rng(seed + i * 311.7) * GAME_HEIGHT,
      size: seed > 2 ? 2 : 1,
    }))
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#ffffff'
    for (const s of this.stars) ctx.fillRect(s.x, s.y, s.size, s.size)
  }
}
