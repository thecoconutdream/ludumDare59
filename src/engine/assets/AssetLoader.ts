export interface AssetDef {
  key: string
  path: string
  width: number
  height: number
  frameWidth?: number
  frameHeight?: number
  placeholderColor: string
  label: string
}

export class AssetLoader {
  private images = new Map<string, HTMLImageElement>()
  private pending: Promise<void>[] = []

  loadImage(key: string, src: string): void {
    const p = new Promise<void>((resolve, reject) => {
      const img = new Image()
      img.onload = () => { this.images.set(key, img); resolve() }
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
      img.src = src
    })
    this.pending.push(p)
  }

  loadManifest(defs: AssetDef[]): void {
    for (const def of defs) {
      const p = new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => { this.images.set(def.key, img); resolve() }
        img.onerror = () => {
          this.images.set(def.key, generatePlaceholder(def))
          resolve()
        }
        img.src = `/assets/${def.path}`
      })
      this.pending.push(p)
    }
  }

  async waitAll(onProgress?: (loaded: number, total: number) => void): Promise<void> {
    const total = this.pending.length
    let loaded = 0
    await Promise.all(
      this.pending.map(p => p.then(() => {
        loaded++
        onProgress?.(loaded, total)
      })),
    )
    this.pending = []
  }

  getImage(key: string): HTMLImageElement {
    const img = this.images.get(key)
    if (!img) throw new Error(`Image not loaded: ${key}`)
    return img
  }

  hasImage(key: string): boolean {
    return this.images.has(key)
  }
}

function generatePlaceholder(def: AssetDef): HTMLImageElement {
  const canvas = document.createElement('canvas')
  canvas.width = def.width
  canvas.height = def.height
  const ctx = canvas.getContext('2d')!

  // Background fill
  ctx.fillStyle = def.placeholderColor + '55'
  ctx.fillRect(0, 0, def.width, def.height)

  // Outer border
  ctx.strokeStyle = def.placeholderColor
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, def.width - 1, def.height - 1)

  // Frame grid for sprite sheets
  if (def.frameWidth && def.frameHeight) {
    ctx.strokeStyle = def.placeholderColor + 'aa'
    ctx.lineWidth = 0.5
    for (let x = def.frameWidth; x < def.width; x += def.frameWidth) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, def.height); ctx.stroke()
    }
    for (let y = def.frameHeight; y < def.height; y += def.frameHeight) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(def.width, y); ctx.stroke()
    }
  }

  // Label — scale font to fit, minimum 5px
  const maxFontSize = Math.min(10, def.width / (def.label.length * 0.7), def.height * 0.4)
  const fontSize = Math.max(5, Math.floor(maxFontSize))
  ctx.fillStyle = '#ffffff'
  ctx.font = `${fontSize}px monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const cx = def.frameWidth ? def.frameWidth / 2 : def.width / 2
  const cy = def.frameHeight ? def.frameHeight / 2 : def.height / 2
  ctx.fillText(def.label, cx, cy, (def.frameWidth ?? def.width) - 2)

  const img = new Image()
  img.src = canvas.toDataURL()
  return img
}
