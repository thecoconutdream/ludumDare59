export const WORD_LENGTH = 5
export const MAX_ATTEMPTS = 6

export type LetterState = 'correct' | 'present' | 'absent'

export interface GuessResult {
  letter: string
  state: LetterState
}

export function checkGuess(guess: string, answer: string): GuessResult[] {
  const result: GuessResult[] = Array(WORD_LENGTH).fill(null).map((_, i) => ({
    letter: guess[i],
    state: 'absent' as LetterState,
  }))
  const used = new Array(WORD_LENGTH).fill(false)

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      result[i].state = 'correct'
      used[i] = true
    }
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i].state === 'correct') continue
    const j = answer.split('').findIndex((c, k) => c === guess[i] && !used[k])
    if (j !== -1) {
      result[i].state = 'present'
      used[j] = true
    }
  }

  return result
}
