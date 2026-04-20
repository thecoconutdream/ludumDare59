import { Client, CLIENTS } from '@game/data/clients'

export type CharacterType = 'cat' | 'dog'
export type Biome = 'ice' | 'jungle' | 'desert' | 'lava'
export type Loot = 'outfit' | 'upgrade' | 'empty'
export type UpgradeType = 'hyperdrive' | 'thruster_damaged' | 'shield' | 'nav_chip'

export const OUTFIT_KEYS = ['cooking_hat', 'delivery_hat', 'space_hat'] as const
export type OutfitKey = typeof OUTFIT_KEYS[number]

export const OUTFIT_LABELS: Record<OutfitKey, string> = {
  cooking_hat:  'Cooking Hat',
  delivery_hat: 'Delivery Cap',
  space_hat:    'Space Helmet',
}

class GameState {
  character: CharacterType = 'cat'
  deliveryCount = 0
  lives = 3
  gameSeed = Math.random() * 100000
  unlockedOutfits: string[] = []
  activeOutfit: string | null = null
  visitedSidePlanets = new Set<string>()
  currentClient: Client | null = null

  upgrades = {
    hyperdrive: false,
    thrusterDamaged: false,
    shield: 0,
    navChip: false,
  }

  // Passed between scenes for context
  pendingLoot: Loot | null = null
  pendingBiome: Biome | null = null
  clientVariant = 1
  escapedFromPos: { x: number; y: number } | null = null

  get playerSpriteKey(): string {
    const base = `player_${this.character}`
    return this.activeOutfit ? `${base}_${this.activeOutfit}` : base
  }

  pickNextClient(): void {
    const prev = this.currentClient
    const pool = CLIENTS.length > 1 ? CLIENTS.filter(c => c !== prev) : CLIENTS
    this.currentClient = pool[Math.floor(Math.random() * pool.length)]
  }

  resetRun(): void {
    this.deliveryCount = 0
    this.lives = 3
    this.unlockedOutfits = []
    this.activeOutfit = null
    this.visitedSidePlanets.clear()
    this.upgrades = { hyperdrive: false, thrusterDamaged: false, shield: 0, navChip: false }
    this.pendingLoot = null
    this.pendingBiome = null
    this.clientVariant = 1
    this.escapedFromPos = null
    this.gameSeed = Math.random() * 100000
    this.currentClient = null
  }

  get maxSpeed(): number {
    let speed = 90
    if (this.upgrades.hyperdrive) speed *= 1.4
    if (this.upgrades.thrusterDamaged) speed *= 0.7
    return speed
  }
}

export const gameState = new GameState()
