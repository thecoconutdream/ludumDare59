import { SceneManager } from './SceneManager'
import { Renderer } from '../rendering/Renderer'
import { InputManager } from '../input/InputManager'

const FIXED_TIMESTEP = 1 / 60

export class GameLoop {
  private running = false
  private lastTime = 0
  private accumulator = 0
  private rafHandle = 0

  constructor(
    private scenes: SceneManager,
    private renderer: Renderer,
    private input: InputManager,
  ) {}

  start(): void {
    this.running = true
    this.lastTime = performance.now()
    this.rafHandle = requestAnimationFrame(this.tick)
  }

  stop(): void {
    this.running = false
    cancelAnimationFrame(this.rafHandle)
  }

  private tick = (timestamp: number): void => {
    if (!this.running) return

    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1)
    this.lastTime = timestamp
    this.accumulator += dt

    while (this.accumulator >= FIXED_TIMESTEP) {
      this.scenes.update(FIXED_TIMESTEP)
      this.input.flush()
      this.accumulator -= FIXED_TIMESTEP
    }

    this.renderer.clear()
    this.scenes.render(this.renderer.ctx)

    this.rafHandle = requestAnimationFrame(this.tick)
  }
}
