import { Scene, SceneManager } from '@engine/core/SceneManager'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { AudioManager } from '@engine/audio/AudioManager'
import { GAME_WIDTH, GAME_HEIGHT } from '@engine/rendering/Renderer'
import { gameState } from '@game/data/GameState'
import { FONT_SM } from '@game/data/ui'
import { PizzeriaExteriorScene } from '@game/scenes/PizzeriaExteriorScene'

interface IntroPhase {
  duration: number
  bgKey: string
  lines: string[]
  subLines?: string[]
}

export class IntroScene implements Scene {
  private phaseIndex = 0
  private phaseTimer = 0

  private readonly phases: IntroPhase[]

  constructor(
    private scenes: SceneManager,
    private input: InputManager,
    private assets: AssetLoader,
    private audio: AudioManager,
  ) {
    gameState.pickNextClient()
    const client = gameState.currentClient!
    const name = gameState.character === 'cat' ? 'Nami' : 'Yumi'
    const charLine = gameState.character === 'cat'
      ? '"Try not to lick the box this time."'
      : '"You are the BEST, ' + name + '! Now GO!"'
    this.phases = [
      {
        duration: 2.5,
        bgKey: 'bg_pizzeria_interior',
        lines: ['COSMIC PIZZA CO.'],
        subLines: ['Galactic Sector 7  ·  Est. 2187'],
      },
      {
        duration: 3.5,
        bgKey: 'bg_pizzeria_interior',
        lines: ['"Hot order incoming!"', `"${name}, you're up!"`],
        subLines: [charLine],
      },
      {
        duration: 4,
        bgKey: 'bg_pizzeria_interior',
        lines: ['NEW ORDER:', client.name],
        subLines: [client.title, `"${client.order}"`, 'Destination: [SIGNAL ENCRYPTED]'],
      },
      {
        duration: 3.5,
        bgKey: 'bg_pizzeria_interior',
        lines: ['"Crack the signal."', '"You know the drill."'],
        subLines: [client.signal, '"Access code unlocks landing clearance."'],
      },
    ]
  }

  onEnter(): void {
    this.phaseIndex = 0
    this.phaseTimer = 0
    if (!this.audio.isPlaying('music_menu')) this.audio.play('music_menu')
  }

  onExit(): void {}

  update(dt: number): void {
    if (this.input.isPressed('cancel')) {
      this.launch()
      return
    }

    if (this.input.isPressed('confirm')) {
      this.audio.play('confirm')
      if (this.phaseIndex >= this.phases.length - 1) {
        this.launch()
      } else {
        this.phaseIndex++
        this.phaseTimer = 0
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const phase = this.phases[Math.min(this.phaseIndex, this.phases.length - 1)]

    ctx.save()

    // Background
    if (this.assets.hasImage(phase.bgKey)) {
      ctx.drawImage(this.assets.getImage(phase.bgKey), 0, 0)
    } else {
      ctx.fillStyle = '#2a1500'
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
      this.drawPizzeriaInterior(ctx)
    }

    // Dialog box
    const lineH = 14
    const subLineH = 12
    const innerW = GAME_WIDTH - 16 - 16
    ctx.font = FONT_SM
    const wrappedSubs = phase.subLines?.flatMap(l => this.wrapText(ctx, l, innerW)) ?? []
    const boxH = phase.subLines
      ? 10 + phase.lines.length * lineH + 6 + wrappedSubs.length * subLineH + 8
      : 10 + phase.lines.length * lineH + 8
    const boxY = GAME_HEIGHT - boxH - 8
    ctx.fillStyle = '#000000cc'
    ctx.fillRect(8, boxY, GAME_WIDTH - 16, boxH)
    ctx.strokeStyle = '#ff6b35'
    ctx.lineWidth = 1
    ctx.strokeRect(8, boxY, GAME_WIDTH - 16, boxH)

    ctx.textAlign = 'left'
    ctx.fillStyle = '#ffffff'
    ctx.font = FONT_SM
    for (let i = 0; i < phase.lines.length; i++) {
      ctx.fillText(phase.lines[i], 16, boxY + 14 + i * 14)
    }

    if (phase.subLines) {
      ctx.fillStyle = '#aaaacc'
      ctx.font = FONT_SM
      for (let i = 0; i < wrappedSubs.length; i++) {
        ctx.fillText(wrappedSubs[i], 16, boxY + 14 + phase.lines.length * 14 + 6 + i * 12)
      }
    }

    // Progress dots
    ctx.textAlign = 'right'
    ctx.fillStyle = '#556677'
    ctx.font = FONT_SM
    ctx.fillText(`${this.phaseIndex + 1}/${this.phases.length} ENTR`, GAME_WIDTH - 12, boxY + boxH - 4)

    ctx.restore()
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let current = ''
    for (const word of words) {
      const test = current ? `${current} ${word}` : word
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current)
        current = word
      } else {
        current = test
      }
    }
    if (current) lines.push(current)
    return lines
  }

  private launch(): void {
    this.scenes.replace(new PizzeriaExteriorScene(this.scenes, this.input, this.assets, this.audio, 'intro'))
  }

  private drawPizzeriaInterior(ctx: CanvasRenderingContext2D): void {
    // Floor
    ctx.fillStyle = '#332211'
    ctx.fillRect(0, 130, GAME_WIDTH, 50)
    // Checkered
    for (let x = 0; x < GAME_WIDTH; x += 20) {
      for (let y = 130; y < 180; y += 20) {
        if (((x / 20) + (y / 20)) % 2 === 0) {
          ctx.fillStyle = '#3d2a15'
          ctx.fillRect(x, y, 20, 20)
        }
      }
    }
    // Counter
    ctx.fillStyle = '#5a3a1a'
    ctx.fillRect(40, 100, 240, 35)
    ctx.fillStyle = '#7a5a2a'
    ctx.fillRect(40, 98, 240, 6)
    // Pizza boxes on counter
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = '#cc4400'
      ctx.fillRect(60 + i * 30, 84, 24, 16)
      ctx.fillStyle = '#ff6600'
      ctx.fillRect(62 + i * 30, 86, 20, 12)
    }
    // Menu board on wall
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(220, 20, 80, 60)
    ctx.fillStyle = '#ff8833'
    ctx.font = FONT_SM
    ctx.textAlign = 'left'
    ctx.fillText('MENU', 225, 32)
    ctx.fillStyle = '#888866'
    ctx.fillText('AstPizza 8c', 225, 44, 72)
    ctx.fillText('BH Sub  12c', 225, 55, 72)
    ctx.fillText('Wings    6c', 225, 66, 72)
    // Boss placeholder
    ctx.fillStyle = '#ff8833'
    ctx.fillRect(150, 60, 20, 40)
    ctx.fillStyle = '#ffcc99'
    ctx.fillRect(154, 48, 12, 14)
    ctx.fillStyle = '#ff6600'
    ctx.fillRect(152, 44, 16, 6)
  }

  private drawPizzeriaExterior(ctx: CanvasRenderingContext2D): void {
    // Alien sky
    ctx.fillStyle = '#0a0028'
    ctx.fillRect(0, 0, GAME_WIDTH, 110)
    // Ground
    ctx.fillStyle = '#1a1a2a'
    ctx.fillRect(0, 110, GAME_WIDTH, 70)
    // Pizzeria building
    ctx.fillStyle = '#2a1a0a'
    ctx.fillRect(10, 50, 100, 70)
    ctx.fillStyle = '#ff6b35'
    ctx.font = FONT_SM
    ctx.textAlign = 'center'
    ctx.fillText('COSMIC', 60, 76)
    ctx.fillText('PIZZA', 60, 87)
    // Neon sign glow
    ctx.shadowColor = '#ff6b35'
    ctx.shadowBlur = 8
    ctx.strokeStyle = '#ff6b35'
    ctx.lineWidth = 1
    ctx.strokeRect(15, 62, 90, 28)
    ctx.shadowBlur = 0
    // Rocket / ship on launch pad
    ctx.fillStyle = '#888899'
    ctx.fillRect(220, 60, 20, 55)
    ctx.fillStyle = '#ff4400'
    ctx.beginPath()
    ctx.moveTo(230, 45)
    ctx.lineTo(240, 65)
    ctx.lineTo(220, 65)
    ctx.closePath()
    ctx.fill()
    // Launch pad
    ctx.fillStyle = '#444455'
    ctx.fillRect(205, 112, 50, 6)
    // Stars
    ctx.fillStyle = '#ffffff'
    const stars = [[30,20],[80,15],[130,30],[180,10],[250,25],[300,18],[50,40],[170,50],[280,40]]
    for (const [x,y] of stars) ctx.fillRect(x, y, 1, 1)
  }
}
