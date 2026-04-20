import { Scene, SceneManager } from '@engine/core/SceneManager'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { AudioManager } from '@engine/audio/AudioManager'
import { GAME_WIDTH, GAME_HEIGHT } from '@engine/rendering/Renderer'
import { gameState, Biome, Loot, OUTFIT_KEYS, OUTFIT_LABELS } from '@game/data/GameState'
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

const OUTFIT_BIOME_FLAVOR: Record<Biome, string> = {
  ice:    'Cryo-preserved. The previous owner left in a hurry.',
  jungle: 'The jungle gave it up. Eventually.',
  desert: 'Sun-bleached but intact. Someone\'s lucky day.',
  lava:   'Lava-tempered. Now yours.',
}

const EMPTY_FLAVORS: Record<Biome, string[]> = {
  ice: [
    'Nothing here. Just ice. And your regrets.',
    'A sign: CLOSED FOR WINTER. Always winter here.',
  ],
  jungle: [
    'Dense jungle. Three things tried to eat you.',
    'Just trees. The trees are watching. Leave.',
  ],
  desert: [
    'Sand everywhere. A cactus gives you a look.',
    'Scorching. Desolate. The cactus waves goodbye.',
  ],
  lava: [
    'Just lava. No loot. Only regret.',
    'Molten rocks. A suspicious smell. Nothing useful.',
  ],
}

const UPGRADE_OPTIONS: Array<{
  key: 'hyperdrive' | 'shield'
  flavor: Record<Biome, string>
}> = [
  {
    key: 'hyperdrive',
    flavor: {
      ice:    'Hyperdrive chip, frosted. Specs say: should be fine.',
      jungle: 'Hyperdrive chip, vine-wrapped. Fully charged somehow.',
      desert: 'Hyperdrive chip, sand-blasted. Adds character.',
      lava:   'Hyperdrive chip, slightly melted. Should be fine.',
    },
  },
  {
    key: 'shield',
    flavor: {
      ice:    'Shield emitter, ice-cold. Still emits. Barely.',
      jungle: 'Shield emitter, overgrown. Works fine, somehow.',
      desert: 'Shield emitter, sun-bleached. Still shields.',
      lava:   'Shield emitter, lava-cooled. Surprisingly intact.',
    },
  },
]

type Phase = 'landing' | 'exploring' | 'loot' | 'done'

export class SidePlanetScene implements Scene {
  private timer = 0
  private phase: Phase = 'landing'
  private biome: Biome
  private loot: Loot
  private lootLabel = ''
  private flavorText = ''
  private foundHat: string | null = null
  private blink = 0

  constructor(
    private scenes: SceneManager,
    private input: InputManager,
    private assets: AssetLoader,
    private audio: AudioManager,
  ) {
    this.biome = gameState.pendingBiome ?? 'ice'
    this.loot = gameState.pendingLoot ?? 'empty'
  }

  onEnter(): void {
    this.rollLoot()
    if (!this.audio.isPlaying('music_space')) this.audio.play('music_space')
  }

  onExit(): void {}

  update(dt: number): void {
    this.timer += dt
    this.blink += dt

    if (this.input.isPressed('confirm')) {
      if (this.phase === 'loot') {
        this.scenes.pop()
      } else {
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
      if (this.loot !== 'empty') this.audio.play('pickup')
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
    const BOX_W = 220
    const INNER_W = BOX_W - 20
    const px = GAME_WIDTH / 2 - BOX_W / 2
    const py = 50
    const cx = GAME_WIDTH / 2

    ctx.font = FONT_SM
    const flavorLines = this.wrapText(ctx, this.flavorText, INNER_W)
    const hasIcon = this.loot === 'outfit' && this.foundHat !== null
    const BOX_H = hasIcon
      ? 22 + 28 + 14 + flavorLines.length * 12 + 14  // header + icon(24) + name + flavor + footer
      : 22 + 10 + flavorLines.length * 12 + 14

    ctx.fillStyle = '#111122'
    ctx.fillRect(px, py, BOX_W, BOX_H)
    ctx.strokeStyle = this.loot === 'empty' ? '#556677'
      : this.loot === 'outfit' ? '#ffcc00' : '#4488ff'
    ctx.lineWidth = 1
    ctx.strokeRect(px, py, BOX_W, BOX_H)

    ctx.textAlign = 'center'
    ctx.font = FONT_SM

    if (this.loot === 'empty') {
      ctx.fillStyle = '#556677'
      ctx.fillText('Nothing here.', cx, py + 14)
    } else if (this.loot === 'outfit') {
      ctx.fillStyle = '#ffcc00'
      ctx.fillText('OUTFIT PIECE FOUND!', cx, py + 14)
    } else {
      ctx.fillStyle = '#4488ff'
      ctx.fillText('SHIP UPGRADE!', cx, py + 14)
    }

    if (this.loot === 'outfit' && this.foundHat) {
      const iconKey = `icon_${this.foundHat}`
      if (this.assets.hasImage(iconKey)) {
        ctx.drawImage(this.assets.getImage(iconKey), 0, 0, 32, 48, cx - 8, py + 22, 16, 24)
      }
      ctx.fillStyle = '#ffffff'
      ctx.font = FONT_SM
      ctx.fillText(OUTFIT_LABELS[this.foundHat as keyof typeof OUTFIT_LABELS] ?? this.foundHat, cx, py + 50)
      ctx.fillStyle = '#aaaacc'
      flavorLines.forEach((l, i) => ctx.fillText(l, cx, py + 62 + i * 12))
    } else {
      ctx.fillStyle = '#aaaacc'
      flavorLines.forEach((l, i) => ctx.fillText(l, cx, py + 28 + i * 12))
    }

    if (Math.sin(this.blink * 4) > 0) {
      ctx.fillStyle = '#aaaacc'
      ctx.fillText('PRESS ENTR to leave', cx, py + BOX_H - 4)
    }
  }

  private rollLoot(): void {
    this.foundHat = null

    if (this.loot === 'empty') {
      const pool = EMPTY_FLAVORS[this.biome]
      this.flavorText = pool[Math.floor(Math.random() * pool.length)]
      this.lootLabel = ''
      return
    }

    if (this.loot === 'upgrade') {
      const option = UPGRADE_OPTIONS[Math.floor(Math.random() * UPGRADE_OPTIONS.length)]
      if (option.key === 'shield') gameState.upgrades.shield++
      else gameState.upgrades[option.key] = true
      this.flavorText = option.flavor[this.biome]
      this.lootLabel = option.key
      return
    }

    // outfit: pick a hat not yet unlocked
    const available = OUTFIT_KEYS.filter(k => !gameState.unlockedOutfits.includes(k))
    if (available.length > 0) {
      const hat = available[Math.floor(Math.random() * available.length)]
      gameState.unlockedOutfits.push(hat)
      gameState.activeOutfit = hat
      this.foundHat = hat
      this.flavorText = OUTFIT_BIOME_FLAVOR[this.biome]
    } else {
      this.flavorText = 'Your collection is complete. Very chic.'
    }
    this.lootLabel = 'outfit'
  }
}
