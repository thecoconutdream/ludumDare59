import { Scene, SceneManager } from '@engine/core/SceneManager'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { AnimationPlayer } from '@engine/rendering/AnimationPlayer'
import { GAME_WIDTH, GAME_HEIGHT } from '@engine/rendering/Renderer'
import { gameState } from '@game/data/GameState'
import { FONT_SM } from '@game/data/ui'
import { PlayerAnims } from '@game/data/animations'
import { SpaceFlightScene } from '@game/scenes/SpaceFlightScene'
import { SuccessScene } from '@game/scenes/SuccessScene'

const WALK_SPEED = 55
const PLAYER_W = 32, PLAYER_H = 48
const PLAYER_DW = 16, PLAYER_DH = 24
const GROUND_Y = 148
const DOOR_X = 72
const PAD_X = 262

export class PizzeriaExteriorScene implements Scene {
  private x: number
  private facingRight: boolean
  private anim = new AnimationPlayer()
  private liftoff = false
  private liftoffTimer = 0

  constructor(
    private scenes: SceneManager,
    private input: InputManager,
    private assets: AssetLoader,
    private mode: 'intro' | 'success',
  ) {
    this.x = mode === 'intro' ? DOOR_X : PAD_X
    this.facingRight = mode === 'intro'
  }

  onEnter(): void {
    this.anim.play(PlayerAnims.idle)
    this.liftoff = false
    this.liftoffTimer = 0
  }

  onExit(): void {}

  update(dt: number): void {
    this.anim.update(dt)

    if (this.liftoff) {
      this.liftoffTimer += dt
      if (this.liftoffTimer > 0.8) {
        this.scenes.replace(new SpaceFlightScene(this.scenes, this.input, this.assets))
      }
      return
    }

    const left = this.input.isHeld('left')
    const right = this.input.isHeld('right')

    if (left)  { this.x -= WALK_SPEED * dt; this.facingRight = false }
    if (right) { this.x += WALK_SPEED * dt; this.facingRight = true }
    this.x = Math.max(10, Math.min(GAME_WIDTH - 10, this.x))

    this.anim.play((left || right) ? PlayerAnims.walk : PlayerAnims.idle)

    if (this.mode === 'intro' && this.x >= PAD_X) {
      this.liftoff = true
    }

    if (this.mode === 'success' && this.x <= DOOR_X + 15 && this.input.isPressed('confirm')) {
      this.scenes.replace(new SuccessScene(this.scenes, this.input, this.assets))
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.assets.hasImage('bg_pizzeria_exterior')) {
      ctx.drawImage(this.assets.getImage('bg_pizzeria_exterior'), 0, 0)
    } else {
      ctx.fillStyle = '#0a0028'
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    }

    // Ship on the launchpad
    const SHIP_W = 64, SHIP_H = 48
    ctx.drawImage(
      this.assets.getImage('ship'),
      PAD_X - SHIP_W / 2, GROUND_Y - SHIP_H,
    )

    const charKey = gameState.character === 'cat' ? 'player_cat' : 'player_dog'
    const frame = this.anim.currentFrame
    const py = GROUND_Y - PLAYER_DH

    ctx.save()
    if (!this.facingRight) {
      ctx.translate(this.x, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(
        this.assets.getImage(charKey),
        frame * PLAYER_W, 0, PLAYER_W, PLAYER_H,
        -PLAYER_DW / 2, py, PLAYER_DW, PLAYER_DH,
      )
    } else {
      ctx.drawImage(
        this.assets.getImage(charKey),
        frame * PLAYER_W, 0, PLAYER_W, PLAYER_H,
        this.x - PLAYER_DW / 2, py, PLAYER_DW, PLAYER_DH,
      )
    }
    ctx.restore()

    ctx.textAlign = 'center'
    ctx.font = FONT_SM
    if (this.mode === 'intro') {
      ctx.fillStyle = '#aaaacc'
      ctx.fillText('Walk to the launchpad  \u2192', GAME_WIDTH / 2, GAME_HEIGHT - 8)
    } else if (this.x <= DOOR_X + 20) {
      ctx.fillStyle = '#44ff88'
      ctx.fillText('[ENTR] ENTER PIZZERIA', GAME_WIDTH / 2, GAME_HEIGHT - 8)
    } else {
      ctx.fillStyle = '#aaaacc'
      ctx.fillText('\u2190  Walk to the pizzeria', GAME_WIDTH / 2, GAME_HEIGHT - 8)
    }
  }
}
