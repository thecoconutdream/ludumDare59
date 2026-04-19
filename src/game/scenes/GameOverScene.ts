import { Scene, SceneManager } from '@engine/core/SceneManager'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { GAME_WIDTH, GAME_HEIGHT } from '@engine/rendering/Renderer'
import { gameState } from '@game/data/GameState'

export class GameOverScene implements Scene {
  private blink = 0

  constructor(
    private scenes: SceneManager,
    private input: InputManager,
    private assets: AssetLoader,
  ) {}

  onEnter(): void {}
  onExit(): void {}

  update(dt: number): void {
    this.blink += dt
    if (this.input.isPressed('confirm')) {
      gameState.resetRun()
      // Lazy import breaks potential circular dep chain at instantiation time
      import('@game/scenes/CharacterSelectScene').then(({ CharacterSelectScene }) => {
        this.scenes.replace(new CharacterSelectScene(this.scenes, this.input, this.assets))
      })
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    ctx.fillStyle = '#cc2222'
    ctx.font = 'bold 20px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('GAME OVER', GAME_WIDTH / 2, 70)

    ctx.fillStyle = '#888899'
    ctx.font = '8px monospace'
    ctx.fillText('You were hit.', GAME_WIDTH / 2, 92)

    ctx.fillStyle = '#ffcc00'
    ctx.font = '7px monospace'
    ctx.fillText(`Deliveries completed: ${gameState.deliveryCount}`, GAME_WIDTH / 2, 110)

    if (Math.sin(this.blink * 3) > 0) {
      ctx.fillStyle = '#ffffff'
      ctx.fillText('PRESS ENTER TO TRY AGAIN', GAME_WIDTH / 2, 140)
    }
  }
}
