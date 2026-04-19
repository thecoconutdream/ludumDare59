import { Camera } from '@engine/rendering/Camera'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { AnimationPlayer } from '@engine/rendering/AnimationPlayer'
import { Vector2 } from '@engine/physics/Vector2'
import { AABB } from '@engine/physics/AABB'
import { gameState } from '@game/data/GameState'
import { PlayerAnims } from '@game/data/animations'
import { GameObject, Anchor } from '@game/entities/GameObject'
import { ShipIgniter } from '@game/entities/ShipIgniter'

const INITIAL_STATS = {
  angle: 0,
  turnSpeed: 4.5,
  acceleration: 220,
  brakeDeceleration: 32
}

// Ship sprite: 64×48px. Colored anchor line at y=32, x-center=32.
const SHIP_W = 64, SHIP_H = 48
const ANCHOR_X = 35, ANCHOR_Y = 32

// Player drawn at 50% scale (32×48 → 16×24)
const PLAYER_W = 32, PLAYER_H = 48
const PLAYER_SCALE = 0.5

export class Ship extends GameObject {
  vel = Vector2.zero()
  turnSpeed = INITIAL_STATS.turnSpeed
  acceleration = INITIAL_STATS.acceleration
  brakeDeceleration = INITIAL_STATS.brakeDeceleration

  private isAccelerating = false
  private anim = new AnimationPlayer()
  private state: 'fly' | 'hit' = 'fly'
  private assets: AssetLoader
  hyperdriveTimer = 0
  private readonly BASE_ACCELERATION = INITIAL_STATS.acceleration
  private igniter: ShipIgniter

  constructor(assets: AssetLoader) {
    super()
    this.assets = assets
    this.angle = INITIAL_STATS.angle
    this.anim.play(PlayerAnims.fly)

    // Create and attach igniter
    this.igniter = new ShipIgniter()
    const igniterAnchor: Anchor = { localPos: Vector2.zero() }
    this.addChild(this.igniter, igniterAnchor)
  }

  triggerHit(): void {
    this.state = 'hit'
    this.anim.play(PlayerAnims.hit)
  }

  resetState(): void {
    this.state = 'fly'
    this.vel = Vector2.zero()
    this.anim.play(PlayerAnims.fly)
  }

  activateHyperdrive(): void {
    this.acceleration = this.BASE_ACCELERATION * 2.2
    this.brakeDeceleration = INITIAL_STATS.brakeDeceleration * 2.5
    this.igniter.activateHyperdrive()
  }

  override update(dt: number): void {
    this.pos = this.pos.add(this.vel.scale(dt))
    this.anim.update(dt)
    this.updateChildren(dt)
  }

  tick(dt: number, input: InputManager, maxSpeed: number): void {
    if (this.state === 'fly') {
      if (input.isHeld('left'))  this.angle -= this.turnSpeed * dt
      if (input.isHeld('right')) this.angle += this.turnSpeed * dt

      this.isAccelerating = input.isHeld('up')
      this.igniter.setAccelerating(this.isAccelerating)

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
    }

    this.update(dt)
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    // Render children first (particles behind ship)
    this.renderChildren(ctx, camera)

    const s = camera.worldToScreen(this.pos)

    ctx.save()
    ctx.translate(s.x, s.y)
    ctx.rotate(this.angle)

    ctx.drawImage(this.assets.getImage('ship'), -SHIP_W / 2, -SHIP_H / 2)

    const charKey = gameState.character === 'cat' ? 'player_cat' : 'player_dog'
    const dw = PLAYER_W * PLAYER_SCALE
    const dh = PLAYER_H * PLAYER_SCALE
    const dx = (ANCHOR_X - SHIP_W / 2) - dw / 2
    const dy = (ANCHOR_Y - SHIP_H / 2) - dh + 4
    ctx.drawImage(this.assets.getImage(charKey), this.anim.currentFrame * PLAYER_W, 0, PLAYER_W, PLAYER_H, dx, dy, dw, dh)

    ctx.restore()

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

  addIgnitionColor(color: string): void {
    this.igniter.addIgnitionColor(color)
  }

  setIgnitionColors(colors: string[]): void {
    this.igniter.setIgnitionColors(colors)
  }
}
