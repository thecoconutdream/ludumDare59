import { Scene, SceneManager } from '@engine/core/SceneManager'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { GAME_WIDTH, GAME_HEIGHT } from '@engine/rendering/Renderer'
import { gameState } from '@game/data/GameState'
import { FONT_SM, FONT_LG } from '@game/data/ui'
import { SpaceFlightScene } from '@game/scenes/SpaceFlightScene'

const OUTFIT_NAMES = [
  'Space Helmet', 'Bomber Jacket', 'Cowboy Hat',
  'Chef Toque', 'Space Suit', 'Chef Coat',
]

export class SuccessScene implements Scene {
  private timer = 0
  private phase: 'deliver' | 'outfit' = 'deliver'
  private newOutfit: string | null = null
  private particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }> = []

  constructor(
    private scenes: SceneManager,
    private input: InputManager,
    private assets: AssetLoader,
  ) {}

  onEnter(): void {
    gameState.deliveryCount++

    // Award a new outfit if there are unlockable ones
    const locked = OUTFIT_NAMES.filter(n => !gameState.unlockedOutfits.includes(n))
    if (locked.length > 0) {
      this.newOutfit = locked[0]
      gameState.unlockedOutfits.push(this.newOutfit)
    }

    // Reset per-delivery upgrades
    gameState.upgrades.hyperdrive = false
    gameState.upgrades.thrusterDamaged = false

    this.spawnParticles()
  }

  onExit(): void {}

  update(dt: number): void {
    this.timer += dt

    for (const p of this.particles) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 40 * dt
      p.life -= dt
    }
    this.particles = this.particles.filter(p => p.life > 0)

    if (this.timer > 2 && this.phase === 'deliver') this.phase = 'outfit'

    if (this.input.isPressed('confirm') || this.timer > 5) {
      this.scenes.replace(new SpaceFlightScene(this.scenes, this.input, this.assets))
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.assets.hasImage('bg_pizzeria_interior')) {
      ctx.drawImage(this.assets.getImage('bg_pizzeria_interior'), 0, 0)
    } else {
      ctx.fillStyle = '#0a0f0a'
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    }

    // Particles
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life)
      ctx.fillStyle = p.color
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 2, 2)
    }
    ctx.globalAlpha = 1

    ctx.textAlign = 'center'

    ctx.fillStyle = '#44ff88'
    ctx.font = FONT_LG
    ctx.fillText('DELIVERED!', GAME_WIDTH / 2, 55)

    ctx.fillStyle = '#aaffcc'
    ctx.font = FONT_SM
    ctx.fillText(`Delivery #${gameState.deliveryCount}`, GAME_WIDTH / 2, 72)

    if (this.phase === 'outfit' && this.newOutfit) {
      ctx.fillStyle = '#ffcc00'
      ctx.font = FONT_SM
      ctx.fillText('NEW OUTFIT!', GAME_WIDTH / 2, 100)

      ctx.fillStyle = '#ffffff'
      ctx.fillText(this.newOutfit, GAME_WIDTH / 2, 114)

      // Outfit preview box
      ctx.strokeStyle = '#ffcc00'
      ctx.lineWidth = 1
      ctx.strokeRect(GAME_WIDTH / 2 - 20, 120, 40, 30)
      ctx.fillStyle = '#ffcc0022'
      ctx.fillRect(GAME_WIDTH / 2 - 20, 120, 40, 30)
      ctx.fillStyle = '#ffcc00'
      ctx.fillText('* NEW *', GAME_WIDTH / 2, 138)
    }

    ctx.fillStyle = '#666688'
    ctx.font = FONT_SM
    ctx.fillText('PRESS ENTR', GAME_WIDTH / 2, GAME_HEIGHT - 10)
  }

  private spawnParticles(): void {
    const colors = ['#ff6b35', '#ffcc00', '#44ff88', '#ff44aa', '#44aaff']
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: GAME_WIDTH / 2 + (Math.random() - 0.5) * 60,
        y: 80,
        vx: (Math.random() - 0.5) * 80,
        vy: -Math.random() * 60 - 20,
        life: 1 + Math.random(),
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }
  }
}
