import { Scene, SceneManager } from '@engine/core/SceneManager'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { GAME_WIDTH, GAME_HEIGHT } from '@engine/rendering/Renderer'
import { FONT_SM, FONT_LG } from '@game/data/ui'
import { CharacterSelectScene } from '@game/scenes/CharacterSelectScene'

export class MainMenuScene implements Scene {
  private time = 0
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
    this.time += dt
    if (this.input.isPressed('confirm')) {
      this.scenes.replace(new CharacterSelectScene(this.scenes, this.input, this.assets))
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#070710'
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    ctx.fillStyle = '#ffffff'
    for (const s of this.stars) ctx.fillRect(s.x, s.y, s.s, s.s)

    // Pizza planet
    ctx.drawImage(this.assets.getImage('planet_home_title'), 210, 55, 160, 160)

    const t = this.time

    // Helper: draw sprite rotated around its center
    const drawRot = (key: string, cx: number, cy: number, w: number, h: number, angle: number, hover = 0) => {
      ctx.save()
      ctx.translate(cx, cy + hover)
      ctx.rotate(angle)
      ctx.drawImage(this.assets.getImage(key), -w / 2, -h / 2, w, h)
      ctx.restore()
    }

    // Top-left: lava planet — slow hover + gentle rotation
    drawRot('planet_side_lava_1', 20, 20, 56, 56, t * 0.15, Math.sin(t * 0.7) * 3)

    // Bottom-left: asteroids — each tumbles at different speed
    drawRot('asteroid_large_1',  18, 148, 22, 22, t * 0.4,  Math.sin(t * 0.9 + 1) * 2)
    drawRot('asteroid_medium_1', 36, 162, 16, 16, t * -0.6, Math.sin(t * 1.1 + 2) * 2)
    drawRot('asteroid_small_1',  10, 163, 10, 10, t * 0.8,  Math.sin(t * 1.3 + 0.5) * 2)

    // Top-right: space junk — slow tumble + hover
    drawRot('junk_satellite', GAME_WIDTH - 14, 14, 18, 18, t * -0.2, Math.sin(t * 0.8) * 2)
    drawRot('junk_panel',     GAME_WIDTH - 22, 30, 14, 14, t * 0.35, Math.sin(t * 1.0 + 1) * 2)
    drawRot('junk_canister',  GAME_WIDTH - 8,  30, 12, 12, t * -0.5, Math.sin(t * 0.6 + 2) * 2)

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
    ctx.fillText('decode the signal.', GAME_WIDTH / 2, 100)
    ctx.fillText('deliver the pizza.', GAME_WIDTH / 2, 112)

    if (Math.sin(this.time * 3) > 0) {
      ctx.fillStyle = '#ffcc00'
      ctx.font = FONT_SM
      ctx.fillText('PRESS ENTR', GAME_WIDTH / 2, 128)
    }

    ctx.fillStyle = '#334455'
    ctx.font = FONT_SM
    ctx.fillText('LUDUM DARE 59', GAME_WIDTH / 2, GAME_HEIGHT - 8)
  }
}
