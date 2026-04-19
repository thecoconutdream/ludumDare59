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
  hyperdrive:        'Hyperdrive (+40%)',
  thruster_damaged:  'Dmg Thruster (-30%)',
  shield:            'Energy Shield',
  nav_chip:          'Nav Chip (ETA)',
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
    // Surface background — placeholder color fill per biome
    ctx.fillStyle = BIOME_COLORS[this.biome] + '33'
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    // Ground strip
    ctx.fillStyle = BIOME_COLORS[this.biome]
    ctx.fillRect(0, GAME_HEIGHT - 30, GAME_WIDTH, 30)

    // Sky
    ctx.fillStyle = '#0a0a1a'
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT - 30)

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

  private renderLootPopup(ctx: CanvasRenderingContext2D): void {
    const px = GAME_WIDTH / 2 - 80
    const py = 60

    ctx.fillStyle = '#111122'
    ctx.fillRect(px, py, 160, 70)

    if (this.loot === 'empty') {
      ctx.strokeStyle = '#556677'
    } else if (this.loot === 'outfit') {
      ctx.strokeStyle = '#ffcc00'
    } else {
      ctx.strokeStyle = '#4488ff'
    }
    ctx.lineWidth = 1
    ctx.strokeRect(px, py, 160, 70)

    ctx.textAlign = 'center'
    const cx = GAME_WIDTH / 2

    if (this.loot === 'empty') {
      ctx.fillStyle = '#556677'
      ctx.font = FONT_SM
      ctx.fillText('Nothing here...', cx, py + 25)
      ctx.fillStyle = '#aaaacc'
      ctx.font = FONT_SM
      ctx.fillText('(Just a barren planet)', cx, py + 38)
    } else if (this.loot === 'outfit') {
      ctx.fillStyle = '#ffcc00'
      ctx.font = FONT_SM
      ctx.fillText('OUTFIT PIECE FOUND!', cx, py + 22)
      ctx.fillStyle = '#ffffff'
      ctx.font = FONT_SM
      ctx.fillText(this.lootLabel, cx, py + 36)
    } else {
      ctx.fillStyle = '#4488ff'
      ctx.font = FONT_SM
      ctx.fillText('SHIP UPGRADE!', cx, py + 22)
      ctx.fillStyle = '#ffffff'
      ctx.font = FONT_SM
      ctx.fillText(this.lootLabel, cx, py + 36, 150)
    }

    if (Math.sin(this.blink * 4) > 0) {
      ctx.fillStyle = '#aaaacc'
      ctx.font = FONT_SM
      ctx.fillText('PRESS ENTR to leave', cx, py + 56)
    }
  }

  private rollLoot(): string {
    if (this.loot === 'empty') return ''

    if (this.loot === 'upgrade') {
      const upgrades = [
        { key: 'hyperdrive', label: UPGRADE_NAMES['hyperdrive'] },
        { key: 'thruster_damaged', label: UPGRADE_NAMES['thruster_damaged'] },
        { key: 'shield', label: UPGRADE_NAMES['shield'] },
        { key: 'nav_chip', label: UPGRADE_NAMES['nav_chip'] },
      ]
      const picked = upgrades[Math.floor(Math.random() * upgrades.length)]
      if (picked.key === 'hyperdrive') gameState.upgrades.hyperdrive = true
      if (picked.key === 'thruster_damaged') gameState.upgrades.thrusterDamaged = true
      if (picked.key === 'shield') gameState.upgrades.shield = true
      if (picked.key === 'nav_chip') gameState.upgrades.navChip = true
      return picked.label
    }

    // outfit: just a label for now, real unlock happens in SuccessScene
    const pieces = ['Hat Fragment', 'Jacket Patch', 'Boot Clasp', 'Glove Shard']
    return pieces[Math.floor(Math.random() * pieces.length)]
  }
}
