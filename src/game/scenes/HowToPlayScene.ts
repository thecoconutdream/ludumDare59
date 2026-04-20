import { Scene, SceneManager } from '@engine/core/SceneManager'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { AudioManager } from '@engine/audio/AudioManager'
import { GAME_WIDTH, GAME_HEIGHT } from '@engine/rendering/Renderer'
import { FONT_SM } from '@game/data/ui'

const COL1 = 16
const COL2 = 130

export class HowToPlayScene implements Scene {
  private pulse = 0

  constructor(
    private scenes: SceneManager,
    private input: InputManager,
    private _assets: AssetLoader,
    private _audio: AudioManager,
  ) {}

  onEnter(): void { this.pulse = 0 }
  onExit(): void {}

  update(dt: number): void {
    this.pulse += dt
    if (this.input.isPressed('confirm') || this.input.isPressed('cancel')) {
      this.scenes.pop()
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#070710'
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    ctx.textAlign = 'center'
    ctx.fillStyle = '#ff6b35'
    ctx.font = FONT_SM
    ctx.fillText('HOW TO PLAY', GAME_WIDTH / 2, 12)

    ctx.strokeStyle = '#223344'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(COL1, 17)
    ctx.lineTo(GAME_WIDTH - COL1, 17)
    ctx.stroke()

    // ── Controls ──────────────────────────────────────────────────────────────
    this.sectionHeader(ctx, 'CONTROLS', 27)

    const controls: Array<[string, string]> = [
      ['UP',         'THRUST'],
      ['DOWN',       'BRAKE'],
      ['LEFT/RIGHT', 'STEER'],
      ['E',          'LAND ON PLANET'],
      ['ENTER',      'CONFIRM / LAND'],
      ['ESC',        'SKIP CUTSCENE'],
      ['SPACE',      'SHOOT RAINBOWS'],
      ['1',          'CHANGE OUTFIT'],
    ]
    let y = 39
    for (const [key, desc] of controls) {
      this.row(ctx, key, desc, y)
      y += 12
    }

    ctx.strokeStyle = '#223344'
    ctx.beginPath()
    ctx.moveTo(COL1, y + 2)
    ctx.lineTo(GAME_WIDTH - COL1, y + 2)
    ctx.stroke()
    y += 14

    // ── Objective ─────────────────────────────────────────────────────────────
    ctx.textAlign = 'center'
    ctx.fillStyle = '#889aaa'
    ctx.font = FONT_SM
    ctx.fillText('Follow the compass to deliver pizza', GAME_WIDTH / 2, y)
    y += 12
    ctx.fillText('and decrypt the security signal.', GAME_WIDTH / 2, y)
    y += 12
    ctx.fillStyle = '#556677'
    ctx.fillText('Normal stuff.', GAME_WIDTH / 2, y)

  }

  private sectionHeader(ctx: CanvasRenderingContext2D, text: string, y: number): void {
    ctx.textAlign = 'left'
    ctx.fillStyle = '#ffcc00'
    ctx.font = FONT_SM
    ctx.fillText(text, COL1, y)
  }

  private row(ctx: CanvasRenderingContext2D, key: string, desc: string, y: number, keyColor = '#44ff88', keyX = COL1): void {
    ctx.textAlign = 'left'
    ctx.fillStyle = keyColor
    ctx.font = FONT_SM
    ctx.fillText(key, keyX, y)
    ctx.fillStyle = '#889aaa'
    ctx.fillText(desc, COL2, y)
  }
}
