import { Vector2 } from '../physics/Vector2'
import { GAME_WIDTH, GAME_HEIGHT } from './Renderer'

export class Camera {
  position: Vector2 = Vector2.zero()
  zoom: number = 1

  worldToScreen(world: Vector2): Vector2 {
    return new Vector2(
      (world.x - this.position.x) * this.zoom + GAME_WIDTH / 2,
      (world.y - this.position.y) * this.zoom + GAME_HEIGHT / 2,
    )
  }

  screenToWorld(screen: Vector2): Vector2 {
    return new Vector2(
      (screen.x - GAME_WIDTH / 2) / this.zoom + this.position.x,
      (screen.y - GAME_HEIGHT / 2) / this.zoom + this.position.y,
    )
  }

  follow(target: Vector2, lerpFactor: number = 0.1): void {
    this.position.x += (target.x - this.position.x) * lerpFactor
    this.position.y += (target.y - this.position.y) * lerpFactor
  }
}
