export interface AnimationClip {
  frames: number[]
  fps: number
  loop?: boolean
}

export class AnimationPlayer {
  private currentClip: AnimationClip | null = null
  private frameTimer = 0
  private frameIndex = 0
  private done = false

  play(clip: AnimationClip): void {
    if (this.currentClip === clip) return
    this.currentClip = clip
    this.frameTimer = 0
    this.frameIndex = 0
    this.done = false
  }

  update(dt: number): void {
    if (!this.currentClip || this.done) return
    this.frameTimer += dt
    const frameDuration = 1 / this.currentClip.fps
    while (this.frameTimer >= frameDuration) {
      this.frameTimer -= frameDuration
      this.frameIndex++
      if (this.frameIndex >= this.currentClip.frames.length) {
        if (this.currentClip.loop !== false) {
          this.frameIndex = 0
        } else {
          this.frameIndex = this.currentClip.frames.length - 1
          this.done = true
        }
      }
    }
  }

  get currentFrame(): number {
    return this.currentClip?.frames[this.frameIndex] ?? 0
  }

  get isFinished(): boolean {
    return this.done
  }
}
