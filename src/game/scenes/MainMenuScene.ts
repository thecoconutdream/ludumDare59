import { Scene, SceneManager } from '@engine/core/SceneManager'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { GAME_WIDTH, GAME_HEIGHT } from '@engine/rendering/Renderer'
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
    ctx.font = 'bold 16px monospace'
    ctx.fillText('SPACE PIZZA', GAME_WIDTH / 2, 60)
    ctx.fillStyle = '#ffcc00'
    ctx.font = 'bold 11px monospace'
    ctx.fillText('DELIVERY', GAME_WIDTH / 2, 76)

    ctx.fillStyle = '#aaaacc'
    ctx.font = '6px monospace'
    ctx.fillText('by a very smart cat or dog', GAME_WIDTH / 2, 92)

    if (Math.sin(this.blink * 3) > 0) {
      ctx.fillStyle = '#ffcc00'
      ctx.font = '8px monospace'
      ctx.fillText('PRESS ENTER TO START', GAME_WIDTH / 2, 125)
    }

    ctx.fillStyle = '#334455'
    ctx.font = '5px monospace'
    ctx.fillText('ludum dare 59', GAME_WIDTH / 2, GAME_HEIGHT - 6)
  }
}
