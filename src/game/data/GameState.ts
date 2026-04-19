export type CharacterType = 'cat' | 'dog'
export type Biome = 'ice' | 'jungle' | 'desert' | 'lava'
export type Loot = 'outfit' | 'upgrade' | 'empty'
export type UpgradeType = 'hyperdrive' | 'thruster_damaged' | 'shield' | 'nav_chip'

class GameState {
  character: CharacterType = 'cat'
  deliveryCount = 0
  lives = 3
  unlockedOutfits: string[] = []
  visitedSidePlanets = new Set<string>()

  upgrades = {
    hyperdrive: false,
    thrusterDamaged: false,
    shield: false,
    navChip: false,
  }

  // Passed between scenes for context
  pendingLoot: Loot | null = null
  pendingBiome: Biome | null = null
  clientVariant = 1

  resetRun(): void {
    this.deliveryCount = 0
    this.lives = 3
    this.unlockedOutfits = []
    this.visitedSidePlanets.clear()
    this.upgrades = { hyperdrive: false, thrusterDamaged: false, shield: false, navChip: false }
    this.pendingLoot = null
    this.pendingBiome = null
    this.clientVariant = 1
  }

  get maxSpeed(): number {
    let speed = 120
    if (this.upgrades.hyperdrive) speed *= 1.4
    if (this.upgrades.thrusterDamaged) speed *= 0.7
    return speed
  }
}

export const gameState = new GameState()
