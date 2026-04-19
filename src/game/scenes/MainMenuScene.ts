import { Scene, SceneManager } from '@engine/core/SceneManager'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { GAME_WIDTH, GAME_HEIGHT } from '@engine/rendering/Renderer'
import { FONT_SM, FONT_LG } from '@game/data/ui'
import { CharacterSelectScene } from '@game/scenes/CharacterSelectScene'

export class MainMenuScene implements Scene {
  private blink = 0
  private stars: Array<{ x: number; y: number; s: number }> = []

  constructor(
    private scenes: SceneManager,
    private input: InputManager,
    private assets: AssetLoader,
  ) {
    for (let i = 0; i < 60; i++) {
      this.stars.push({
        x: Math.floor(Math.random() * GAME_WIDTH),
        y: Math.floor(Math.random() * GAME_HEIGHT),
        s: Math.random() > 0.85 ? 2 : 1,
      })
    }
  }

  onEnter(): void {}
  onExit(): void {}

  update(dt: number): void {
    this.blink += dt
    if (this.input.isPressed('confirm')) {
      this.scenes.replace(new CharacterSelectScene(this.scenes, this.input, this.assets))
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#070710'
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    ctx.fillStyle = '#ffffff'
    for (const s of this.stars) ctx.fillRect(s.x, s.y, s.s, s.s)

    // Pizza planet decoration
    ctx.fillStyle = '#ff6b3533'
    ctx.beginPath()
    ctx.arc(260, 140, 50, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#ff6b3566'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(260, 140, 50, 0, Math.PI * 2)
    ctx.stroke()

    // Title
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ff6b35'
    ctx.font = FONT_LG
    ctx.fillText('SPACE PIZZA', GAME_WIDTH / 2, 60)
    ctx.fillStyle = '#ffcc00'
    ctx.font = FONT_LG
    ctx.fillText('DELIVERY', GAME_WIDTH / 2, 80)

    ctx.fillStyle = '#aaaacc'
    ctx.font = FONT_SM
    ctx.fillText('a cat or dog in space', GAME_WIDTH / 2, 100)

    if (Math.sin(this.blink * 3) > 0) {
      ctx.fillStyle = '#ffcc00'
      ctx.font = FONT_SM
      ctx.fillText('PRESS ENTER', GAME_WIDTH / 2, 128)
    }

    ctx.fillStyle = '#334455'
    ctx.font = FONT_SM
    ctx.fillText('LUDUM DARE 59', GAME_WIDTH / 2, GAME_HEIGHT - 8)
  }
}
