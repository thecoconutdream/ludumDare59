export interface Frame {
  sx: number
  sy: number
  sw: number
  sh: number
}

export class SpriteSheet {
  readonly frames: Frame[]

  constructor(
    public readonly image: HTMLImageElement,
    public readonly frameWidth: number,
    public readonly frameHeight: number,
  ) {
    this.frames = this.sliceFrames()
  }

  private sliceFrames(): Frame[] {
    const cols = Math.floor(this.image.width / this.frameWidth)
    const rows = Math.floor(this.image.height / this.frameHeight)
    const frames: Frame[] = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        frames.push({
          sx: col * this.frameWidth,
          sy: row * this.frameHeight,
          sw: this.frameWidth,
          sh: this.frameHeight,
        })
      }
    }
    return frames
  }

  drawFrame(
    ctx: CanvasRenderingContext2D,
    frameIndex: number,
    x: number,
    y: number,
    scaleX: number = 1,
    scaleY: number = 1,
  ): void {
    const frame = this.frames[frameIndex]
    if (!frame) return
    const dw = this.frameWidth * Math.abs(scaleX)
    const dh = this.frameHeight * Math.abs(scaleY)

    ctx.save()
    ctx.translate(x, y)
    if (scaleX < 0 || scaleY < 0) ctx.scale(Math.sign(scaleX) || 1, Math.sign(scaleY) || 1)
    ctx.drawImage(this.image, frame.sx, frame.sy, frame.sw, frame.sh, -dw / 2, -dh / 2, dw, dh)
    ctx.restore()
  }
}
