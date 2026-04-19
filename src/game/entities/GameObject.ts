import { Vector2 } from '@engine/physics/Vector2'
import { Camera } from '@engine/rendering/Camera'

export interface Anchor {
  localPos: Vector2
}

export interface ChildAttachment {
  child: GameObject
  anchor: Anchor
}

export abstract class GameObject {
  pos = Vector2.zero()
  angle = 0
  protected children: ChildAttachment[] = []

  abstract update(dt: number): void
  abstract render(ctx: CanvasRenderingContext2D, camera: Camera): void

  addChild(child: GameObject, anchor: Anchor): void {
    this.children.push({ child, anchor })
  }

  removeChild(child: GameObject): void {
    this.children = this.children.filter(c => c.child !== child)
  }

  protected renderChildren(ctx: CanvasRenderingContext2D, camera: Camera): void {
    for (const { child, anchor } of this.children) {
      // Update child position relative to parent
      const cos = Math.cos(this.angle)
      const sin = Math.sin(this.angle)
      const rotatedX = anchor.localPos.x * cos - anchor.localPos.y * sin
      const rotatedY = anchor.localPos.x * sin + anchor.localPos.y * cos
      child.pos = this.pos.add(new Vector2(rotatedX, rotatedY))
      child.angle = this.angle
      child.render(ctx, camera)
    }
  }

  protected updateChildren(dt: number): void {
    for (const { child } of this.children) {
      child.update(dt)
    }
  }
}
