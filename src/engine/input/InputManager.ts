export type ActionMap = Record<string, string[]>

const PREVENT_DEFAULT_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space',
])

export class InputManager {
  private heldKeys = new Set<string>()
  private justPressedKeys = new Set<string>()
  private justReleasedKeys = new Set<string>()

  constructor(private actions: ActionMap = {}) {
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (PREVENT_DEFAULT_KEYS.has(e.code)) e.preventDefault()
    if (!this.heldKeys.has(e.code)) {
      this.justPressedKeys.add(e.code)
    }
    this.heldKeys.add(e.code)
  }

  private onKeyUp = (e: KeyboardEvent): void => {
    this.heldKeys.delete(e.code)
    this.justReleasedKeys.add(e.code)
  }

  isHeld(action: string): boolean {
    const keys = this.actions[action] ?? [action]
    return keys.some(k => this.heldKeys.has(k))
  }

  isPressed(action: string): boolean {
    const keys = this.actions[action] ?? [action]
    return keys.some(k => this.justPressedKeys.has(k))
  }

  isReleased(action: string): boolean {
    const keys = this.actions[action] ?? [action]
    return keys.some(k => this.justReleasedKeys.has(k))
  }

  flush(): void {
    this.justPressedKeys.clear()
    this.justReleasedKeys.clear()
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
  }
}
