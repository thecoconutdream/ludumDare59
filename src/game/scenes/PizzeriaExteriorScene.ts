import { Scene, SceneManager } from '@engine/core/SceneManager'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { AudioManager } from '@engine/audio/AudioManager'
import { AnimationPlayer } from '@engine/rendering/AnimationPlayer'
import { GAME_WIDTH, GAME_HEIGHT } from '@engine/rendering/Renderer'
import { gameState, OUTFIT_LABELS } from '@game/data/GameState'
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
    private audio: AudioManager,
    private mode: 'intro' | 'success',
  ) {
    this.x = mode === 'intro' ? DOOR_X : PAD_X
    this.facingRight = mode === 'intro'
  }

  onEnter(): void {
    this.anim.play(PlayerAnims.idle)
    this.liftoff = false
    this.liftoffTimer = 0
    if (this.mode === 'success') this.audio.stop('music_tense')
    if (!this.audio.isPlaying('music_menu')) this.audio.play('music_menu')
  }

  onExit(): void {}

  update(dt: number): void {
    this.anim.update(dt)

    if (this.liftoff) {
      this.liftoffTimer += dt
      if (this.liftoffTimer > 0.8) {
        this.scenes.replace(new SpaceFlightScene(this.scenes, this.input, this.assets, this.audio))
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
      this.audio.play('confirm')
      this.scenes.replace(new SuccessScene(this.scenes, this.input, this.assets, this.audio))
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

    const charKey = gameState.playerSpriteKey
    const frame = this.anim.currentFrame
    const isWalking = PlayerAnims.walk.frames.includes(frame)
    const dw = isWalking ? 24 : PLAYER_DW
    const dh = isWalking ? 32 : PLAYER_DH
    const py = GROUND_Y - dh

    ctx.save()
    if (!this.facingRight) {
      ctx.translate(this.x, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(
        this.assets.getImage(charKey),
        frame * PLAYER_W, 0, PLAYER_W, PLAYER_H,
        -dw / 2, py, dw, dh,
      )
    } else {
      ctx.drawImage(
        this.assets.getImage(charKey),
        frame * PLAYER_W, 0, PLAYER_W, PLAYER_H,
        this.x - dw / 2, py, dw, dh,
      )
    }
    ctx.restore()

    if (gameState.unlockedOutfits.length > 0) {
      this.renderOutfitTray(ctx)
    }

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

  private renderOutfitTray(ctx: CanvasRenderingContext2D): void {
    // [no hat] + each unlocked hat, right-aligned at top
    const options: Array<string | null> = [null, ...gameState.unlockedOutfits]
    const SLOT = 18   // slot width = height (square)
    const GAP = 2
    const totalW = options.length * (SLOT + GAP) - GAP
    const startX = GAME_WIDTH - 4 - totalW
    const trayY = 4

    for (let i = 0; i < options.length; i++) {
      const key = options[i]
      const x = startX + i * (SLOT + GAP)
      const isActive = gameState.activeOutfit === key

      ctx.fillStyle = '#111122'
      ctx.fillRect(x, trayY, SLOT, SLOT)
      ctx.strokeStyle = isActive ? '#ffcc00' : '#334455'
      ctx.lineWidth = 1
      ctx.strokeRect(x, trayY, SLOT, SLOT)

      if (key === null) {
        // "no hat" slot — draw a small X
        ctx.fillStyle = isActive ? '#ffcc00' : '#556677'
        ctx.font = FONT_SM
        ctx.textAlign = 'center'
        ctx.fillText('-', x + SLOT / 2, trayY + SLOT - 4)
      } else {
        const iconKey = `icon_${key}`
        if (this.assets.hasImage(iconKey)) {
          ctx.drawImage(this.assets.getImage(iconKey), 0, 0, 32, 48, x + 1, trayY + 1, SLOT - 2, SLOT - 2)
        }
      }
    }

    // E hint + active label
    ctx.textAlign = 'right'
    ctx.fillStyle = '#556677'
    ctx.font = FONT_SM
    ctx.fillText('[1] outfit', startX - 4, trayY + SLOT - 4)

    if (gameState.activeOutfit) {
      const label = OUTFIT_LABELS[gameState.activeOutfit as keyof typeof OUTFIT_LABELS] ?? gameState.activeOutfit
      ctx.fillStyle = '#ffcc00'
      ctx.textAlign = 'right'
      ctx.fillText(label, GAME_WIDTH - 4, trayY + SLOT + 10)
    }
  }
}
