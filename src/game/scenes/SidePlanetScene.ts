import { Scene, SceneManager } from '@engine/core/SceneManager'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { GAME_WIDTH, GAME_HEIGHT } from '@engine/rendering/Renderer'
import { gameState, Biome, Loot } from '@game/data/GameState'
import { FONT_SM } from '@game/data/ui'

const BIOME_COLORS: Record<Biome, string> = {
  ice:    '#aaddff',
  jungle: '#336633',
  desert: '#cc8833',
  lava:   '#993311',
}

const BIOME_LABELS: Record<Biome, string> = {
  ice:    'ICE PLANET',
  jungle: 'JUNGLE PLANET',
  desert: 'DESERT PLANET',
  lava:   'LAVA PLANET',
}

const UPGRADE_NAMES: Record<string, string> = {
  hyperdrive: 'Hyperdrive Boost',
  shield:     'Energy Shield',
}

type Phase = 'landing' | 'exploring' | 'loot' | 'done'

export class SidePlanetScene implements Scene {
  private timer = 0
  private phase: Phase = 'landing'
  private biome: Biome
  private loot: Loot
  private lootLabel = ''
  private blink = 0

  constructor(
    private scenes: SceneManager,
    private input: InputManager,
    private assets: AssetLoader,
  ) {
    this.biome = gameState.pendingBiome ?? 'ice'
    this.loot = gameState.pendingLoot ?? 'empty'
  }

  onEnter(): void {
    this.lootLabel = this.rollLoot()
  }

  onExit(): void {}

  update(dt: number): void {
    this.timer += dt
    this.blink += dt

    if (this.input.isPressed('confirm')) {
      if (this.phase === 'loot') {
        this.scenes.pop()
      } else {
        // Skip straight to loot
        this.phase = 'loot'
        this.timer = 0
      }
      return
    }

    if (this.phase === 'landing' && this.timer > 0.6) {
      this.phase = 'exploring'
      this.timer = 0
    }
    if (this.phase === 'exploring' && this.timer > 0.8) {
      this.phase = 'loot'
      this.timer = 0
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const bgKey = `bg_side_${this.biome}`
    if (this.assets.hasImage(bgKey)) {
      ctx.drawImage(this.assets.getImage(bgKey), 0, 0)
    } else {
      ctx.fillStyle = '#0a0a1a'
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT - 30)
      ctx.fillStyle = BIOME_COLORS[this.biome]
      ctx.fillRect(0, GAME_HEIGHT - 30, GAME_WIDTH, 30)
    }

    // Biome label
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ffffff'
    ctx.font = FONT_SM
    ctx.fillText(BIOME_LABELS[this.biome], GAME_WIDTH / 2, 20)

    if (this.phase === 'landing') {
      ctx.fillStyle = '#aaaacc'
      ctx.font = FONT_SM
      ctx.fillText('Landing...', GAME_WIDTH / 2, GAME_HEIGHT / 2)
    }

    if (this.phase === 'exploring') {
      ctx.fillStyle = '#aaaacc'
      ctx.font = FONT_SM
      ctx.fillText('Exploring...', GAME_WIDTH / 2, GAME_HEIGHT / 2)
    }

    if (this.phase === 'loot') {
      this.renderLootPopup(ctx)
    }
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

  private renderLootPopup(ctx: CanvasRenderingContext2D): void {
    const BOX_W = 200
    const px = GAME_WIDTH / 2 - BOX_W / 2
    const py = 55

    ctx.fillStyle = '#111122'
    ctx.fillRect(px, py, BOX_W, 80)

    ctx.strokeStyle = this.loot === 'empty' ? '#556677' : this.loot === 'outfit' ? '#ffcc00' : '#4488ff'
    ctx.lineWidth = 1
    ctx.strokeRect(px, py, BOX_W, 80)

    ctx.textAlign = 'center'
    ctx.font = FONT_SM
    const cx = GAME_WIDTH / 2
    const innerW = BOX_W - 16

    if (this.loot === 'empty') {
      ctx.fillStyle = '#556677'
      ctx.fillText('Nothing here...', cx, py + 22)
      ctx.fillStyle = '#aaaacc'
      const lines = this.wrapText(ctx, '(Just a barren planet)', innerW)
      lines.forEach((l, i) => ctx.fillText(l, cx, py + 34 + i * 12))
    } else if (this.loot === 'outfit') {
      ctx.fillStyle = '#ffcc00'
      ctx.fillText('OUTFIT PIECE FOUND!', cx, py + 22)
      ctx.fillStyle = '#ffffff'
      this.wrapText(ctx, this.lootLabel, innerW).forEach((l, i) => ctx.fillText(l, cx, py + 36 + i * 12))
    } else {
      ctx.fillStyle = '#4488ff'
      ctx.fillText('SHIP UPGRADE!', cx, py + 22)
      ctx.fillStyle = '#ffffff'
      this.wrapText(ctx, this.lootLabel, innerW).forEach((l, i) => ctx.fillText(l, cx, py + 36 + i * 12))
    }

    if (Math.sin(this.blink * 4) > 0) {
      ctx.fillStyle = '#aaaacc'
      ctx.fillText('PRESS ENTR to leave', cx, py + 68)
    }
  }

  private rollLoot(): string {
    if (this.loot === 'empty') return ''

    if (this.loot === 'upgrade') {
      const upgrades = [
        { key: 'hyperdrive', label: UPGRADE_NAMES['hyperdrive'] },
        { key: 'shield',     label: UPGRADE_NAMES['shield'] },
      ]
      const picked = upgrades[Math.floor(Math.random() * upgrades.length)]
      if (picked.key === 'hyperdrive') gameState.upgrades.hyperdrive = true
      if (picked.key === 'shield') gameState.upgrades.shield = true
      return picked.label
    }

    // outfit: just a label for now, real unlock happens in SuccessScene
    const pieces = ['Hat Fragment', 'Jacket Patch', 'Boot Clasp', 'Glove Shard']
    return pieces[Math.floor(Math.random() * pieces.length)]
  }
}
