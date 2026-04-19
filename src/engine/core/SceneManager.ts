export interface Scene {
  onEnter(): void
  onExit(): void
  update(dt: number): void
  render(ctx: CanvasRenderingContext2D): void
}

export class SceneManager {
  private stack: Scene[] = []

  get current(): Scene | undefined {
    return this.stack[this.stack.length - 1]
  }

  push(scene: Scene): void {
    this.current?.onExit()
    this.stack.push(scene)
    scene.onEnter()
  }

  pop(): void {
    const scene = this.stack.pop()
    scene?.onExit()
    this.current?.onEnter()
  }

  replace(scene: Scene): void {
    const old = this.stack.pop()
    old?.onExit()
    this.stack.push(scene)
    scene.onEnter()
  }

  update(dt: number): void {
    this.current?.update(dt)
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.current?.render(ctx)
  }
}
