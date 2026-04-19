import { Scene, SceneManager } from '@engine/core/SceneManager'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { GAME_WIDTH, GAME_HEIGHT } from '@engine/rendering/Renderer'
import { gameState } from '@game/data/GameState'
import { FONT_SM } from '@game/data/ui'
import { SpaceFlightScene } from '@game/scenes/SpaceFlightScene'

interface IntroPhase {
  duration: number
  bgKey: string
  lines: string[]
  subLines?: string[]
}

export class IntroScene implements Scene {
  private phaseIndex = 0
  private phaseTimer = 0
  private fadeAlpha = 0
  private shakeY = 0

  private readonly phases: IntroPhase[]

  constructor(
    private scenes: SceneManager,
    private input: InputManager,
    private assets: AssetLoader,
  ) {
    const name = gameState.character === 'cat' ? 'nami' : 'yumi'
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
        lines: ['"Hot order incoming!"', `"${name}, you\'re up!"`],
        subLines: ['Boss slides the slip across the counter.'],
      },
      {
        duration: 2.5,
        bgKey: 'bg_pizzeria_interior',
        lines: ['"Wealthy client."', '"Don\'t mess this up."'],
        subLines: ['You grab the pizza box. It\'s warm.'],
      },
      {
        duration: 2.5,
        bgKey: 'bg_pizzeria_exterior',
        lines: ['Heading to the launchpad...'],
        subLines: ['The rocket hisses on its pad.'],
      },
      {
        duration: 2.0,
        bgKey: 'bg_pizzeria_exterior',
        lines: ['IGNITION'],
        subLines: ['3... 2... 1...'],
      },
    ]
  }

  onEnter(): void {
    this.phaseIndex = 0
    this.phaseTimer = 0
    this.fadeAlpha = 0
  }

  onExit(): void {}

  update(dt: number): void {
    if (this.input.isPressed('cancel')) {
      this.launch()
      return
    }

    // Liftoff phase plays out automatically once triggered
    if (this.phaseIndex === this.phases.length - 1) {
      this.phaseTimer += dt
      const progress = this.phaseTimer / this.phases[this.phaseIndex].duration
      this.shakeY = progress > 0.4 ? (Math.random() - 0.5) * progress * 6 : 0
      this.fadeAlpha = Math.min(1, (progress - 0.6) / 0.4)
      if (this.phaseTimer >= this.phases[this.phaseIndex].duration) {
        this.launch()
      }
      return
    }

    if (this.input.isPressed('confirm')) {
      this.phaseIndex++
      this.phaseTimer = 0
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const phase = this.phases[Math.min(this.phaseIndex, this.phases.length - 1)]

    ctx.save()
    ctx.translate(0, Math.round(this.shakeY))

    // Background
    if (this.assets.hasImage(phase.bgKey)) {
      ctx.drawImage(this.assets.getImage(phase.bgKey), 0, 0)
    } else {
      ctx.fillStyle = phase.bgKey.includes('exterior') ? '#1a0a2a' : '#2a1500'
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

      // Simple placeholder scene elements
      if (phase.bgKey.includes('interior')) {
        this.drawPizzeriaInterior(ctx)
      } else {
        this.drawPizzeriaExterior(ctx)
      }
    }

    // Dialog box
    const lineH = 14
    const subLineH = 12
    const boxH = phase.subLines
      ? 10 + phase.lines.length * lineH + 6 + phase.subLines.length * subLineH + 8
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
      for (let i = 0; i < phase.subLines.length; i++) {
        ctx.fillText(phase.subLines[i], 16, boxY + 14 + phase.lines.length * 14 + 6 + i * 12)
      }
    }

    // Progress dots
    ctx.textAlign = 'right'
    ctx.fillStyle = '#556677'
    ctx.font = FONT_SM
    ctx.fillText(`${this.phaseIndex + 1}/${this.phases.length} ENTR`, GAME_WIDTH - 12, boxY + boxH - 4)

    ctx.restore()

    // Fade to black on liftoff
    if (this.fadeAlpha > 0) {
      ctx.fillStyle = `rgba(0,0,0,${this.fadeAlpha})`
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    }
  }

  private launch(): void {
    this.scenes.replace(new SpaceFlightScene(this.scenes, this.input, this.assets))
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
