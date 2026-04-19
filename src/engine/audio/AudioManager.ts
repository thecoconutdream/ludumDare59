import { Howl } from 'howler'

interface SoundDef {
  src: string | string[]
  loop?: boolean
  volume?: number
}

export class AudioManager {
  private sounds = new Map<string, Howl>()

  register(name: string, def: SoundDef): void {
    this.sounds.set(name, new Howl({
      src: Array.isArray(def.src) ? def.src : [def.src],
      loop: def.loop ?? false,
      volume: def.volume ?? 1,
    }))
  }

  play(name: string): number {
    return this.sounds.get(name)?.play() ?? -1
  }

  stop(name: string): void {
    this.sounds.get(name)?.stop()
  }

  setVolume(name: string, volume: number): void {
    this.sounds.get(name)?.volume(volume)
  }

  isPlaying(name: string): boolean {
    return this.sounds.get(name)?.playing() ?? false
  }
}
