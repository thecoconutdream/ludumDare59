import { Camera } from '@engine/rendering/Camera'
import { InputManager } from '@engine/input/InputManager'
import { Vector2 } from '@engine/physics/Vector2'
import { AABB } from '@engine/physics/AABB'
import { gameState } from '@game/data/GameState'

const INITIAL_STATS = {
  angle: 0,
  turnSpeed: 4.5,
  acceleration: 220,
  brakeDeceleration: 32
}

export class Ship {
  pos = Vector2.zero()
  vel = Vector2.zero()
  angle = INITIAL_STATS.angle;
  turnSpeed = INITIAL_STATS.turnSpeed;
  acceleration = INITIAL_STATS.acceleration;
  brakeDeceleration = INITIAL_STATS.brakeDeceleration;

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

  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const s = camera.worldToScreen(this.pos)
    ctx.save()
    ctx.translate(s.x, s.y)
    ctx.rotate(this.angle)
    ctx.fillStyle = '#44ff88'
    ctx.beginPath()
    ctx.moveTo(12, 0)
    ctx.lineTo(-9, -6)
    ctx.lineTo(-6, 0)
    ctx.lineTo(-9, 6)
    ctx.closePath()
    ctx.fill()
    const flameThreshold = this.isAccelerating ? 0.5 : 0.7
    if (Math.random() > flameThreshold) {
      if (this.isAccelerating) {
        ctx.fillStyle = '#ff6600'
        ctx.fillRect(-11, -2, 4, 4)
      } else {
        ctx.fillStyle = '#66bbff'
        ctx.fillRect(-10, -1, 2, 2)
      }
    }
    ctx.restore()

    if (gameState.upgrades.shield) {
      ctx.strokeStyle = `rgba(68,170,255,${0.4 + Math.sin(Date.now() / 200) * 0.2})`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(s.x, s.y, 16, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  get bounds(): AABB {
    return new AABB(this.pos.x - 8, this.pos.y - 5, 16, 10)
  }
}
