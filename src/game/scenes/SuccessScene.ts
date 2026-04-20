import { Scene, SceneManager } from '@engine/core/SceneManager'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { AudioManager } from '@engine/audio/AudioManager'
import { GAME_WIDTH, GAME_HEIGHT } from '@engine/rendering/Renderer'
import { gameState, OUTFIT_KEYS, OUTFIT_LABELS } from '@game/data/GameState'
import { FONT_SM, FONT_LG } from '@game/data/ui'
import { SpaceFlightScene } from '@game/scenes/SpaceFlightScene'

export class SuccessScene implements Scene {
  private timer = 0
  private phase: 'deliver' | 'neworder' = 'deliver'
  private newOutfit: string | null = null
  private deliveredQuote = ''
  private nextClientName = ''
  private nextClientOrder = ''
  private blinkTimer = 0
  private particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }> = []

  constructor(
    private scenes: SceneManager,
    private input: InputManager,
    private assets: AssetLoader,
    private audio: AudioManager,
  ) {}

  onEnter(): void {
    this.deliveredQuote = gameState.currentClient?.successQuote ?? '"Good job. I suppose."'
    gameState.deliveryCount++

    const locked = OUTFIT_KEYS.filter(k => !gameState.unlockedOutfits.includes(k))
    if (locked.length > 0) {
      this.newOutfit = locked[Math.floor(Math.random() * locked.length)]
      gameState.unlockedOutfits.push(this.newOutfit)
    } else {
      this.newOutfit = null
    }

    // Reset per-delivery upgrades, then pick next client
    gameState.upgrades.hyperdrive = false
    gameState.upgrades.thrusterDamaged = false
    gameState.pickNextClient()
    this.nextClientName = gameState.currentClient?.name ?? ''
    this.nextClientOrder = gameState.currentClient?.order ?? ''

    this.timer = 0
    this.blinkTimer = 0
    this.phase = 'deliver'
    this.audio.stop('music_menu')
    this.audio.play('success')
    this.spawnParticles()
  }

  onExit(): void {}

  update(dt: number): void {
    this.timer += dt
    this.blinkTimer += dt

    for (const p of this.particles) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 40 * dt
      p.life -= dt
    }
    this.particles = this.particles.filter(p => p.life > 0)

    if (this.input.isPressed('confirm')) {
      this.audio.play('confirm')
      if (this.phase === 'deliver') {
        this.phase = 'neworder'
        this.timer = 0
      } else {
        gameState.deliveredSuccessfully = true
        this.scenes.replace(new SpaceFlightScene(this.scenes, this.input, this.assets, this.audio))
      }
      return
    }

    if (this.timer > 5 && this.phase === 'deliver') {
      this.phase = 'neworder'
      this.timer = 0
    }
    if (this.timer > 5 && this.phase === 'neworder') {
      gameState.deliveredSuccessfully = true
      this.scenes.replace(new SpaceFlightScene(this.scenes, this.input, this.assets, this.audio))
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.assets.hasImage('bg_pizzeria_interior')) {
      ctx.drawImage(this.assets.getImage('bg_pizzeria_interior'), 0, 0)
    } else {
      ctx.fillStyle = '#0a0f0a'
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    }

    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life)
      ctx.fillStyle = p.color
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 2, 2)
    }
    ctx.globalAlpha = 1
    ctx.textAlign = 'center'

    if (this.phase === 'deliver') {
      this.renderDeliver(ctx)
    } else {
      this.renderNewOrder(ctx)
    }

    if (Math.sin(this.blinkTimer * 3) > 0) {
      ctx.fillStyle = '#666688'
      ctx.font = FONT_SM
      ctx.fillText('PRESS ENTR', GAME_WIDTH / 2, GAME_HEIGHT - 10)
    }
  }

  private renderDeliver(ctx: CanvasRenderingContext2D): void {
    const cx = GAME_WIDTH / 2

    ctx.fillStyle = '#44ff88'
    ctx.font = FONT_LG
    ctx.fillText('DELIVERED!', cx, 28)

    ctx.fillStyle = '#aaffcc'
    ctx.font = FONT_SM
    ctx.fillText(`Delivery #${gameState.deliveryCount}`, cx, 44)

    // Client quote box
    const quoteLines = this.wrapText(ctx, this.deliveredQuote, 284)
    const boxH = 10 + quoteLines.length * 12 + 8
    const boxY = 54
    ctx.fillStyle = '#111122'
    ctx.fillRect(8, boxY, GAME_WIDTH - 16, boxH)
    ctx.strokeStyle = '#44ff88'
    ctx.lineWidth = 1
    ctx.strokeRect(8, boxY, GAME_WIDTH - 16, boxH)
    ctx.fillStyle = '#aaffcc'
    ctx.font = FONT_SM
    quoteLines.forEach((l, i) => ctx.fillText(l, cx, boxY + 10 + i * 12))

    const outfitY = boxY + boxH + 10
    if (this.newOutfit && this.timer > 2) {
      ctx.fillStyle = '#ffcc00'
      ctx.font = FONT_SM
      ctx.fillText('NEW HAT UNLOCKED!', cx, outfitY)
      const iconKey = `icon_${this.newOutfit}`
      if (this.assets.hasImage(iconKey)) {
        ctx.drawImage(this.assets.getImage(iconKey), 0, 0, 32, 48, cx - 8, outfitY + 4, 16, 24)
      }
      ctx.fillStyle = '#ffffff'
      ctx.fillText(OUTFIT_LABELS[this.newOutfit as keyof typeof OUTFIT_LABELS] ?? this.newOutfit, cx, outfitY + 32)
      ctx.fillStyle = '#aaaacc'
      ctx.font = FONT_SM
      ctx.fillText('Equip at the pizzeria [E]', cx, outfitY + 44)
    }
  }

  private renderNewOrder(ctx: CanvasRenderingContext2D): void {
    const cx = GAME_WIDTH / 2
    const client = gameState.currentClient

    ctx.fillStyle = '#ffcc00'
    ctx.font = FONT_LG
    ctx.fillText('NEW ORDER!', cx, 24)

    if (!client) return

    ctx.font = FONT_SM
    const titleLines = this.wrapText(ctx, client.title, 284)
    const orderLines = this.wrapText(ctx, `"${client.order}"`, 284)
    const boxH = 14 + 12 + titleLines.length * 11 + 8 + orderLines.length * 11 + 10
    const boxY = 34

    ctx.fillStyle = '#111122'
    ctx.fillRect(8, boxY, GAME_WIDTH - 16, boxH)
    ctx.strokeStyle = '#ffcc00'
    ctx.lineWidth = 1
    ctx.strokeRect(8, boxY, GAME_WIDTH - 16, boxH)

    let y = boxY + 12
    ctx.fillStyle = '#ffffff'
    ctx.fillText(client.name, cx, y)
    y += 12
    ctx.fillStyle = '#aaaacc'
    titleLines.forEach(l => { ctx.fillText(l, cx, y); y += 11 })
    y += 6
    ctx.fillStyle = '#ffcc00'
    orderLines.forEach(l => { ctx.fillText(l, cx, y); y += 11 })
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let current = ''
    for (const word of words) {
      const test = current ? `${current} ${word}` : word
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current)
        current = word
      } else {
        current = test
      }
    }
    if (current) lines.push(current)
    return lines
  }

  private spawnParticles(): void {
    const colors = ['#ff6b35', '#ffcc00', '#44ff88', '#ff44aa', '#44aaff']
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: GAME_WIDTH / 2 + (Math.random() - 0.5) * 60,
        y: 60,
        vx: (Math.random() - 0.5) * 80,
        vy: -Math.random() * 60 - 20,
        life: 1 + Math.random(),
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }
  }
}
