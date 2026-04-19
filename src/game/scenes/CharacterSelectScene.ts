import { Scene, SceneManager } from '@engine/core/SceneManager'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { GAME_WIDTH, GAME_HEIGHT } from '@engine/rendering/Renderer'
import { SpriteSheet } from '@engine/rendering/SpriteSheet'
import { gameState, CharacterType } from '@game/data/GameState'
import { FONT_SM } from '@game/data/ui'
import { IntroScene } from '@game/scenes/IntroScene'

const CHARACTERS: Array<{ type: CharacterType; label: string; desc: string; color: string }> = [
  { type: 'cat', label: 'nami',  desc: 'Clever cat.\nSpeed bonus.', color: '#ff8844' },
  { type: 'dog', label: 'yumi',  desc: 'Brave dog.\nShield bonus.', color: '#4488ff' },
]

export class CharacterSelectScene implements Scene {
  private selected = 0
  private blink = 0

  constructor(
    private scenes: SceneManager,
    private input: InputManager,
    private assets: AssetLoader,
  ) {}

  onEnter(): void { this.selected = 0 }
  onExit(): void {}

  update(dt: number): void {
    this.blink += dt

    if (this.input.isPressed('left'))  this.selected = 0
    if (this.input.isPressed('right')) this.selected = 1

    if (this.input.isPressed('confirm')) {
      gameState.character = CHARACTERS[this.selected].type
      this.scenes.replace(new IntroScene(this.scenes, this.input, this.assets))
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#0a0a1a'
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    ctx.fillStyle = '#ffffff'
    ctx.font = FONT_SM
    ctx.textAlign = 'center'
    ctx.fillText('CHOOSE YOUR BREED', GAME_WIDTH / 2, 22)

    ctx.fillStyle = '#556677'
    ctx.font = FONT_SM
    ctx.fillText('< > : PICK   ENTR : GO', GAME_WIDTH / 2, 34)

    for (let i = 0; i < CHARACTERS.length; i++) {
      const ch = CHARACTERS[i]
      const isSelected = i === this.selected
      const cx = i === 0 ? GAME_WIDTH / 4 : (GAME_WIDTH / 4) * 3
      const cardX = cx - 50
      const cardY = 45

      // Card background
      ctx.fillStyle = isSelected ? ch.color + '33' : '#11111f'
      ctx.fillRect(cardX, cardY, 100, 110)

      // Border
      ctx.strokeStyle = isSelected ? ch.color : '#334455'
      ctx.lineWidth = isSelected ? 2 : 1
      ctx.strokeRect(cardX, cardY, 100, 110)

      // Character sprite — idle frame 0
      const assetKey = ch.type === 'cat' ? 'player_cat' : 'player_dog'
      if (this.assets.hasImage(assetKey)) {
        const sheet = new SpriteSheet(this.assets.getImage(assetKey), 32, 48)
        sheet.drawFrame(ctx, 0, cx, cardY + 30)
      } else {
        ctx.fillStyle = ch.color + (isSelected ? 'cc' : '55')
        ctx.fillRect(cx - 16, cardY + 8, 32, 40)
      }

      // Name
      ctx.fillStyle = isSelected ? ch.color : '#aaaacc'
      ctx.font = FONT_SM
      ctx.fillText(ch.label, cx, cardY + 60)

      // Description
      ctx.fillStyle = '#889aaa'
      ctx.font = FONT_SM
      const lines = ch.desc.split('\n')
      for (let l = 0; l < lines.length; l++) {
        ctx.fillText(lines[l], cx, cardY + 74 + l * 12)
      }

      // Selected indicator
      if (isSelected && Math.sin(this.blink * 4) > 0) {
        ctx.fillStyle = ch.color
        ctx.fillText('^', cx, cardY + 108)
      }
    }

    if (Math.sin(this.blink * 3) > 0) {
      ctx.fillStyle = '#ffcc00'
      ctx.font = FONT_SM
      ctx.textAlign = 'center'
      ctx.fillText('PRESS ENTR', GAME_WIDTH / 2, GAME_HEIGHT - 10)
    }
  }
}
