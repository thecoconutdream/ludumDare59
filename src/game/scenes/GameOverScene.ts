import { Scene, SceneManager } from '@engine/core/SceneManager'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { AudioManager } from '@engine/audio/AudioManager'
import { GAME_WIDTH, GAME_HEIGHT } from '@engine/rendering/Renderer'
import { gameState } from '@game/data/GameState'
import { FONT_SM, FONT_LG } from '@game/data/ui'

export class GameOverScene implements Scene {
  private blink = 0

  constructor(
    private scenes: SceneManager,
    private input: InputManager,
    private assets: AssetLoader,
    private audio: AudioManager,
  ) {}

  onEnter(): void {
    this.audio.stop('music_menu')
    this.audio.stop('music_space')
    this.audio.stop('music_tense')
    this.audio.play('game_over')
  }

  onExit(): void {}

  update(dt: number): void {
    this.blink += dt
    if (this.input.isPressed('confirm')) {
      this.audio.play('confirm')
      gameState.resetRun()
      // Lazy import breaks potential circular dep chain at instantiation time
      import('@game/scenes/CharacterSelectScene').then(({ CharacterSelectScene }) => {
        this.scenes.replace(new CharacterSelectScene(this.scenes, this.input, this.assets, this.audio))
      })
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    ctx.fillStyle = '#cc2222'
    ctx.font = FONT_LG
    ctx.textAlign = 'center'
    ctx.fillText('GAME OVER', GAME_WIDTH / 2, 70)

    ctx.fillStyle = '#888899'
    ctx.font = FONT_SM
    ctx.fillText('You were hit.', GAME_WIDTH / 2, 94)

    ctx.fillStyle = '#ffcc00'
    ctx.textAlign = 'center'
    const deliveryText = `x ${gameState.deliveryCount}`
    const textW = ctx.measureText(deliveryText).width
    const totalW = 8 + 4 + textW
    const lineX = GAME_WIDTH / 2 - totalW / 2
    if (this.assets.hasImage('pizza')) {
      ctx.drawImage(this.assets.getImage('pizza'), 0, 0, 32, 48, lineX, 102, 8, 12)
    }
    ctx.textAlign = 'left'
    ctx.fillText(deliveryText, lineX + 12, 112)

    if (Math.sin(this.blink * 3) > 0) {
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.fillText('PRESS ENTR', GAME_WIDTH / 2, 140)
    }
  }
}
