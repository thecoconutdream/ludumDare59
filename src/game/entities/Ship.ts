import { Camera } from '@engine/rendering/Camera'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { Vector2 } from '@engine/physics/Vector2'
import { AABB } from '@engine/physics/AABB'
import { gameState } from '@game/data/GameState'

const INITIAL_STATS = {
  angle: 0,
  turnSpeed: 4.5,
  acceleration: 220,
  brakeDeceleration: 32
}

// Ship sprite: 64×48px. Colored anchor line at y=32, x-center=32.
const SHIP_W = 64, SHIP_H = 48
const ANCHOR_X = 32, ANCHOR_Y = 32

// Player drawn at 50% scale (32×48 → 16×24)
const PLAYER_W = 32, PLAYER_H = 48
const PLAYER_SCALE = 0.5
const PLAYER_FLY_FRAME = 8

export class Ship {
  pos = Vector2.zero()
  vel = Vector2.zero()
  angle = INITIAL_STATS.angle
  turnSpeed = INITIAL_STATS.turnSpeed
  acceleration = INITIAL_STATS.acceleration
  brakeDeceleration = INITIAL_STATS.brakeDeceleration

  private isAccelerating = false

  update(dt: number, input: InputManager, maxSpeed: number): void {
    if (input.isHeld('left'))  this.angle -= this.turnSpeed * dt
    if (input.isHeld('right')) this.angle += this.turnSpeed * dt

    this.isAccelerating = input.isHeld('up')
    if (this.isAccelerating) {
      const forward = new Vector2(Math.cos(this.angle), Math.sin(this.angle))
      this.vel = this.vel.add(forward.scale(this.acceleration * dt))
    }

    if (input.isHeld('down')) {
      const speed = this.vel.magnitude()
      if (speed > 0.001) {
        const brakeStep = this.brakeDeceleration * dt
        this.vel = brakeStep >= speed
          ? Vector2.zero()
          : this.vel.add(this.vel.normalized().scale(-brakeStep))
      }
    }

    if (this.vel.magnitude() > maxSpeed) {
      this.vel = this.vel.normalized().scale(maxSpeed)
    }

    this.pos = this.pos.add(this.vel.scale(dt))
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera, assets: AssetLoader): void {
    const s = camera.worldToScreen(this.pos)

    ctx.save()
    ctx.translate(s.x, s.y)
    ctx.rotate(this.angle)

    ctx.drawImage(assets.getImage('ship'), -SHIP_W / 2, -SHIP_H / 2)

    const charKey = gameState.character === 'cat' ? 'player_cat' : 'player_dog'
    const dw = PLAYER_W * PLAYER_SCALE
    const dh = PLAYER_H * PLAYER_SCALE
    const dx = (ANCHOR_X - SHIP_W / 2) - dw / 2
    const dy = (ANCHOR_Y - SHIP_H / 2) - dh / 2
    ctx.drawImage(assets.getImage(charKey), PLAYER_FLY_FRAME * PLAYER_W, 0, PLAYER_W, PLAYER_H, dx, dy, dw, dh)

    ctx.restore()

    if (this.isAccelerating && Math.random() > 0.4) {
      ctx.save()
      ctx.translate(s.x, s.y)
      ctx.rotate(this.angle)
      ctx.fillStyle = '#ff6600'
      ctx.fillRect(-SHIP_W / 2 - 8, -3, 8, 6)
      ctx.restore()
    }

    if (gameState.upgrades.shield) {
      ctx.strokeStyle = `rgba(68,170,255,${0.4 + Math.sin(Date.now() / 200) * 0.2})`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(s.x, s.y, 36, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  get bounds(): AABB {
    return new AABB(this.pos.x - 24, this.pos.y - 16, 48, 32)
  }
}
