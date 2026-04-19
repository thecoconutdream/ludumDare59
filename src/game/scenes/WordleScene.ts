import { Scene, SceneManager } from '@engine/core/SceneManager'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { GAME_WIDTH, GAME_HEIGHT } from '@engine/rendering/Renderer'
import { gameState } from '@game/data/GameState'
import { FONT_SM } from '@game/data/ui'
import { WORD_LENGTH, MAX_ATTEMPTS, LetterState, GuessResult, checkGuess } from '@game/data/wordleLogic'
import { wordList } from '@game/data/wordList'
import { SuccessScene } from '@game/scenes/SuccessScene'
import { EscapeScene } from '@game/scenes/EscapeScene'

const validWords = wordList.filter((word) => word.length === WORD_LENGTH)
if (validWords.length === 0) {
  throw new Error('wordList must contain at least one 5-letter word')
}

export const ANSWER = validWords[Math.floor(Math.random() * validWords.length)]

// ─── Layout constants ─────────────────────────────────────────────────────────
const CELL = 16
const GAP = 2
const GRID_X = Math.floor(GAME_WIDTH / 2 - (WORD_LENGTH * (CELL + GAP) - GAP) / 2)
const GRID_Y = 14

const KB_ROWS = [
  ['Q','W','E','R','T','Z','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['OK','Y','X','C','V','B','N','M','<'],
]

// ─── Scene ────────────────────────────────────────────────────────────────────
export class WordleScene implements Scene {
  private guesses: GuessResult[][] = []
  private currentInput = ''
  private shake = 0
  private flashMsg = ''
  private flashTimer = 0
  private result: 'playing' | 'won' | 'lost' = 'playing'
  private resultTimer = 0
  private readonly kbHandler: (e: KeyboardEvent) => void

  constructor(
    private scenes: SceneManager,
    private input: InputManager,
    private assets: AssetLoader,
  ) {
    // Bind once so we can remove it on exit
    this.kbHandler = (e: KeyboardEvent) => this.handleKey(e.key)
  }

  onEnter(): void {
    window.addEventListener('keydown', this.kbHandler)
  }

  onExit(): void {
    window.removeEventListener('keydown', this.kbHandler)
  }

  update(dt: number): void {
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 8)
    if (this.flashTimer > 0) this.flashTimer -= dt

    if (this.result !== 'playing') {
      this.resultTimer += dt
      if (this.resultTimer > 2) {
        if (this.result === 'won') {
          this.scenes.replace(new SuccessScene(this.scenes, this.input, this.assets))
        } else {
          this.scenes.replace(new EscapeScene(this.scenes, this.input, this.assets))
        }
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const bgKey = `bg_client_surface_${gameState.clientVariant}`
    if (this.assets.hasImage(bgKey)) {
      ctx.drawImage(this.assets.getImage(bgKey), 0, 0)
    } else {
      ctx.fillStyle = '#1a1025'
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    }

    ctx.fillStyle = '#000000aa'
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    ctx.textAlign = 'center'
    ctx.fillStyle = '#ffcc00'
    ctx.font = FONT_SM
    ctx.fillText('DECRYPT THE PASSWORD', GAME_WIDTH / 2, 10)

    this.renderGrid(ctx)
    this.renderKeyboard(ctx)

    if (this.flashTimer > 0) {
      ctx.fillStyle = '#ff6644'
      ctx.font = FONT_SM
      ctx.textAlign = 'center'
      ctx.fillText(this.flashMsg, GAME_WIDTH / 2, GRID_Y + MAX_ATTEMPTS * (CELL + GAP) + 6)
    }

    if (this.result !== 'playing') {
      ctx.fillStyle = 'rgba(0,0,0,0.75)'
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
      if (this.result === 'won') {
        ctx.fillStyle = '#44ff88'
        ctx.font = FONT_SM
        ctx.textAlign = 'center'
        ctx.fillText('ACCESS GRANTED!', GAME_WIDTH / 2, GAME_HEIGHT / 2)
      } else {
        ctx.fillStyle = '#ff4444'
        ctx.font = FONT_SM
        ctx.textAlign = 'center'
        ctx.fillText('ACCESS DENIED!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 8)
        ctx.fillStyle = '#aaaacc'
        ctx.fillText(`WORD: ${ANSWER}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10)
      }
    }
  }

  private renderGrid(ctx: CanvasRenderingContext2D): void {
    const ox = this.shake > 0 ? Math.round((Math.random() - 0.5) * 3) : 0

    for (let row = 0; row < MAX_ATTEMPTS; row++) {
      for (let col = 0; col < WORD_LENGTH; col++) {
        const x = GRID_X + col * (CELL + GAP) + ox
        const y = GRID_Y + row * (CELL + GAP)
        let bg = '#1a1a2e'
        let letter = ''

        if (row < this.guesses.length) {
          const g = this.guesses[row][col]
          letter = g.letter
          if (g.state === 'correct') bg = '#538d4e'
          else if (g.state === 'present') bg = '#b59f3b'
          else bg = '#3a3a3c'
        } else if (row === this.guesses.length && this.result === 'playing') {
          letter = this.currentInput[col] ?? ''
          bg = '#222244'
        }

        ctx.fillStyle = bg
        ctx.fillRect(x, y, CELL, CELL)
        ctx.strokeStyle = '#444466'
        ctx.lineWidth = 1
        ctx.strokeRect(x, y, CELL, CELL)

        if (letter) {
          ctx.fillStyle = '#ffffff'
          ctx.font = FONT_SM
          ctx.textAlign = 'center'
          ctx.fillText(letter, x + CELL / 2, y + CELL - 4)
        }
      }
    }
  }

  private renderKeyboard(ctx: CanvasRenderingContext2D): void {
    const keyStates = this.buildKeyStates()
    const KW = 14
    const KH = 12
    const kbY = GRID_Y + MAX_ATTEMPTS * (CELL + GAP) + 8

    for (let row = 0; row < KB_ROWS.length; row++) {
      const keys = KB_ROWS[row]
      const rowW = keys.reduce((sum, k) => sum + (k.length > 1 ? KW + 8 : KW) + 1, -1)
      const startX = Math.floor(GAME_WIDTH / 2 - rowW / 2)

      let offsetX = 0
      for (let col = 0; col < keys.length; col++) {
        const key = keys[col]
        const kw = key.length > 1 ? KW + 8 : KW
        const x = startX + offsetX
        const y = kbY + row * (KH + 2)
        offsetX += kw + 1

        const state = keyStates[key]
        let bg = '#2a2a3e'
        if (state === 'correct') bg = '#538d4e'
        else if (state === 'present') bg = '#b59f3b'
        else if (state === 'absent') bg = '#111111'

        ctx.fillStyle = bg
        ctx.fillRect(x, y, kw, KH)
        ctx.fillStyle = '#ccccdd'
        ctx.font = FONT_SM
        ctx.textAlign = 'center'
        ctx.fillText(key, x + kw / 2, y + KH - 2)
      }
    }
  }

  private buildKeyStates(): Record<string, LetterState> {
    const priority: LetterState[] = ['correct', 'present', 'absent']
    const states: Record<string, LetterState> = {}
    for (const guess of this.guesses) {
      for (const { letter, state } of guess) {
        const cur = states[letter]
        if (!cur || priority.indexOf(state) < priority.indexOf(cur)) states[letter] = state
      }
    }
    return states
  }

  private handleKey(key: string): void {
    if (this.result !== 'playing') return

    if (key === 'Backspace' || key === '<') {
      this.currentInput = this.currentInput.slice(0, -1)
    } else if (key === 'Enter' || key === 'OK') {
      this.submit()
    } else if (/^[A-Za-z]$/.test(key) && this.currentInput.length < WORD_LENGTH) {
      this.currentInput += key.toUpperCase()
    }
  }

  private submit(): void {
    if (this.currentInput.length < WORD_LENGTH) {
      this.flashMsg = 'Not enough letters'
      this.flashTimer = 1.5
      this.shake = 1
      return
    }

    const results = checkGuess(this.currentInput, ANSWER)
    this.guesses.push(results)
    this.currentInput = ''

    if (results.every(r => r.state === 'correct')) {
      this.result = 'won'
      this.resultTimer = 0
    } else if (this.guesses.length >= MAX_ATTEMPTS) {
      this.result = 'lost'
      this.resultTimer = 0
    }
  }
}
