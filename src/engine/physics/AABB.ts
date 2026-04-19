import { Vector2 } from './Vector2'

export class AABB {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
  ) {}

  get right(): number { return this.x + this.width }
  get bottom(): number { return this.y + this.height }
  get center(): Vector2 { return new Vector2(this.x + this.width / 2, this.y + this.height / 2) }

  intersects(other: AABB): boolean {
    return (
      this.x < other.right &&
      this.right > other.x &&
      this.y < other.bottom &&
      this.bottom > other.y
    )
  }

  contains(point: Vector2): boolean {
    return point.x >= this.x && point.x <= this.right &&
           point.y >= this.y && point.y <= this.bottom
  }

  translated(dx: number, dy: number): AABB {
    return new AABB(this.x + dx, this.y + dy, this.width, this.height)
  }
}
