export class Vector2 {
  constructor(public x: number = 0, public y: number = 0) {}

  add(other: Vector2): Vector2 {
    return new Vector2(this.x + other.x, this.y + other.y)
  }

  sub(other: Vector2): Vector2 {
    return new Vector2(this.x - other.x, this.y - other.y)
  }

  scale(factor: number): Vector2 {
    return new Vector2(this.x * factor, this.y * factor)
  }

  dot(other: Vector2): number {
    return this.x * other.x + this.y * other.y
  }

  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  normalized(): Vector2 {
    const mag = this.magnitude()
    if (mag === 0) return new Vector2()
    return new Vector2(this.x / mag, this.y / mag)
  }

  distanceTo(other: Vector2): number {
    return this.sub(other).magnitude()
  }

  angleTo(other: Vector2): number {
    return Math.atan2(other.y - this.y, other.x - this.x)
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y)
  }

  static zero(): Vector2 {
    return new Vector2(0, 0)
  }
}
