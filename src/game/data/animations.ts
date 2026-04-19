export interface AnimClip {
  frames: number[]
  fps: number
  loop: boolean
}

export const PlayerAnims: Record<string, AnimClip> = {
  idle:      { frames: [0, 1, 2, 3],           fps: 6,  loop: true  },
  walk:      { frames: [4, 5, 6, 7],           fps: 8,  loop: true  },
  fly:       { frames: [8, 9, 10],             fps: 2,  loop: true  },
  celebrate: { frames: [11, 12, 13, 14],       fps: 10, loop: false },
  hit:       { frames: [15],                   fps: 12, loop: false },
  dead:      { frames: [16],                   fps: 6,  loop: false },
}
