export function rng(seed: number): number {
  const x = Math.sin(seed) * 43758.5453
  return x - Math.floor(x)
}
