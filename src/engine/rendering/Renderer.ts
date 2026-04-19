export const GAME_WIDTH = 320
export const GAME_HEIGHT = 180

export class Renderer {
  readonly canvas: HTMLCanvasElement
  readonly ctx: CanvasRenderingContext2D

  constructor(container: HTMLElement) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = GAME_WIDTH
    this.canvas.height = GAME_HEIGHT
    this.canvas.style.imageRendering = 'pixelated'
    container.appendChild(this.canvas)

    this.ctx = this.canvas.getContext('2d')!
    this.ctx.imageSmoothingEnabled = false

    this.resize()
    window.addEventListener('resize', () => this.resize())
  }

  clear(): void {
    this.ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
  }

  private resize(): void {
    const scaleX = window.innerWidth / GAME_WIDTH
    const scaleY = window.innerHeight / GAME_HEIGHT
    const scale = Math.min(scaleX, scaleY)
    const displayW = Math.floor(GAME_WIDTH * scale)
    const displayH = Math.floor(GAME_HEIGHT * scale)

    this.canvas.style.width = `${displayW}px`
    this.canvas.style.height = `${displayH}px`
    this.canvas.style.position = 'absolute'
    this.canvas.style.left = `${(window.innerWidth - displayW) / 2}px`
    this.canvas.style.top = `${(window.innerHeight - displayH) / 2}px`
  }
}
