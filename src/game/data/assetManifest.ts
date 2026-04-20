import { AssetDef } from '@engine/assets/AssetLoader'

// Color coding by category
const C = {
  character: '#4488ff',
  outfit:    '#66aaff',
  ship:      '#44ff88',
  planet:    '#aa44ff',
  bg:        '#334466',
  obstacle:  '#ff8844',
  hazard:    '#ff4444',
  npc:       '#ffcc44',
  ui:        '#44ffcc',
}

export const assetManifest: AssetDef[] = [

  // ─── Characters — 32×48px frames, single row of 17 frames = 544×48px ───────
  {
    key: 'player_cat',
    path: 'sprites/player/nami.png',
    width: 544, height: 48, frameWidth: 32, frameHeight: 48,
    placeholderColor: C.character, label: 'CAT',
  },
  {
    key: 'player_dog',
    path: 'sprites/player/yumi.png',
    width: 544, height: 48, frameWidth: 32, frameHeight: 48,
    placeholderColor: C.character, label: 'DOG',
  },

  // ─── Characters with hats — same 544×48 spritesheet as base ─────────────
  {
    key: 'player_cat_cooking_hat',
    path: 'sprites/player/nami_cooking_hat.png',
    width: 544, height: 48, frameWidth: 32, frameHeight: 48,
    placeholderColor: C.character, label: 'CAT+COOK',
  },
  {
    key: 'player_cat_delivery_hat',
    path: 'sprites/player/nami_delivery_hat.png',
    width: 544, height: 48, frameWidth: 32, frameHeight: 48,
    placeholderColor: C.character, label: 'CAT+DEL',
  },
  {
    key: 'player_cat_space_hat',
    path: 'sprites/player/nami_space_hat.png',
    width: 544, height: 48, frameWidth: 32, frameHeight: 48,
    placeholderColor: C.character, label: 'CAT+SPC',
  },
  {
    key: 'player_dog_cooking_hat',
    path: 'sprites/player/yumi_cooking_hat.png',
    width: 544, height: 48, frameWidth: 32, frameHeight: 48,
    placeholderColor: C.character, label: 'DOG+COOK',
  },
  {
    key: 'player_dog_delivery_hat',
    path: 'sprites/player/yumi_delivery_hat.png',
    width: 544, height: 48, frameWidth: 32, frameHeight: 48,
    placeholderColor: C.character, label: 'DOG+DEL',
  },
  {
    key: 'player_dog_space_hat',
    path: 'sprites/player/yumi_space_hat.png',
    width: 544, height: 48, frameWidth: 32, frameHeight: 48,
    placeholderColor: C.character, label: 'DOG+SPC',
  },

  // ─── Hat icons (32×48 single-frame, for UI tray) ─────────────────────────
  {
    key: 'icon_cooking_hat',
    path: 'sprites/upgrades/cooking_hat.png',
    width: 32, height: 48,
    placeholderColor: C.outfit, label: 'COOK HAT',
  },
  {
    key: 'icon_delivery_hat',
    path: 'sprites/upgrades/delivery_hat.png',
    width: 32, height: 48,
    placeholderColor: C.outfit, label: 'DEL HAT',
  },
  {
    key: 'icon_space_hat',
    path: 'sprites/upgrades/space_hat.png',
    width: 32, height: 48,
    placeholderColor: C.outfit, label: 'SPC HAT',
  },

  // ─── Pizza icon (HUD) ─────────────────────────────────────────────────────
  {
    key: 'pizza',
    path: 'sprites/pizza.png',
    width: 32, height: 48,
    placeholderColor: '#ff6b35', label: 'PIZZA',
  },

  // ─── Spaceship ─────────────────────────────────────────────────────────────
  {
    key: 'ship',
    path: 'sprites/spaceship/spaceship.png',
    width: 64, height: 48,
    placeholderColor: C.ship, label: 'SHIP',
  },
  {
    key: 'ship_upgrade_boost',
    path: 'sprites/ship/upgrade_boost_glow.png',
    width: 192, height: 32, frameWidth: 48, frameHeight: 32,
    placeholderColor: C.ship, label: 'BOOST',
  },
  {
    key: 'ship_upgrade_damaged',
    path: 'sprites/ship/upgrade_damaged_smoke.png',
    width: 192, height: 32, frameWidth: 48, frameHeight: 32,
    placeholderColor: C.ship, label: 'DMGSMK',
  },
  {
    key: 'ship_upgrade_shield',
    path: 'sprites/ship/upgrade_shield.png',
    width: 192, height: 32, frameWidth: 48, frameHeight: 32,
    placeholderColor: C.ship, label: 'SHIELD',
  },

  // ─── Planets ───────────────────────────────────────────────────────────────
  {
    key: 'planet_home_title',
    path: 'sprites/planets/planet_home_title.png',
    width: 200, height: 200,
    placeholderColor: C.planet, label: 'HOME TITLE',
  },
  {
    key: 'planet_home',
    path: 'sprites/planets/planet_home.png',
    width: 48, height: 48,
    placeholderColor: C.planet, label: 'HOME',
  },
  {
    key: 'planet_client_1',
    path: 'sprites/planets/planet_client_1.png',
    width: 48, height: 48,
    placeholderColor: C.planet, label: 'CLI 1',
  },
  {
    key: 'planet_client_2',
    path: 'sprites/planets/planet_client_2.png',
    width: 48, height: 48,
    placeholderColor: C.planet, label: 'CLI 2',
  },
  {
    key: 'planet_client_3',
    path: 'sprites/planets/planet_client_3.png',
    width: 48, height: 48,
    placeholderColor: C.planet, label: 'CLI 3',
  },
  {
    key: 'planet_client_1_armed',
    path: 'sprites/planets/planet_client_1_armed.png',
    width: 48, height: 48,
    placeholderColor: C.hazard, label: 'CLI1 ARM',
  },
  {
    key: 'planet_client_2_armed',
    path: 'sprites/planets/planet_client_2_armed.png',
    width: 48, height: 48,
    placeholderColor: C.hazard, label: 'CLI2 ARM',
  },
  {
    key: 'planet_client_3_armed',
    path: 'sprites/planets/planet_client_3_armed.png',
    width: 48, height: 48,
    placeholderColor: C.hazard, label: 'CLI3 ARM',
  },
  {
    key: 'planet_side_ice_1',
    path: 'sprites/planets/planet_side_ice_1.png',
    width: 40, height: 40,
    placeholderColor: '#aaddff', label: 'ICE 1',
  },
  {
    key: 'planet_side_ice_2',
    path: 'sprites/planets/planet_side_ice_2.png',
    width: 40, height: 40,
    placeholderColor: '#aaddff', label: 'ICE 2',
  },
  {
    key: 'planet_side_jungle_1',
    path: 'sprites/planets/planet_side_jungle_1.png',
    width: 40, height: 40,
    placeholderColor: '#44aa44', label: 'JNG 1',
  },
  {
    key: 'planet_side_jungle_2',
    path: 'sprites/planets/planet_side_jungle_2.png',
    width: 40, height: 40,
    placeholderColor: '#44aa44', label: 'JNG 2',
  },
  {
    key: 'planet_side_desert_1',
    path: 'sprites/planets/planet_side_desert_1.png',
    width: 40, height: 40,
    placeholderColor: '#ddaa44', label: 'DST 1',
  },
  {
    key: 'planet_side_desert_2',
    path: 'sprites/planets/planet_side_desert_2.png',
    width: 40, height: 40,
    placeholderColor: '#ddaa44', label: 'DST 2',
  },
  {
    key: 'planet_side_lava_1',
    path: 'sprites/planets/planet_side_lava_1.png',
    width: 40, height: 40,
    placeholderColor: '#ff4400', label: 'LVA 1',
  },
  {
    key: 'planet_side_lava_2',
    path: 'sprites/planets/planet_side_lava_2.png',
    width: 40, height: 40,
    placeholderColor: '#ff4400', label: 'LVA 2',
  },
  {
    key: 'planet_side_dead_1',
    path: 'sprites/planets/planet_side_dead_1.png',
    width: 40, height: 40,
    placeholderColor: '#666666', label: 'DEAD 1',
  },
  {
    key: 'planet_side_dead_2',
    path: 'sprites/planets/planet_side_dead_2.png',
    width: 40, height: 40,
    placeholderColor: '#666666', label: 'DEAD 2',
  },

  // ─── Space Parallax Backgrounds ────────────────────────────────────────────
  {
    key: 'bg_space_far',
    path: 'sprites/bg/space_far.png',
    width: 320, height: 180,
    placeholderColor: C.bg, label: 'BG FAR',
  },
  {
    key: 'bg_space_mid',
    path: 'sprites/bg/space_mid.png',
    width: 320, height: 180,
    placeholderColor: C.bg, label: 'BG MID',
  },
  {
    key: 'bg_space_near',
    path: 'sprites/bg/space_near.png',
    width: 320, height: 180,
    placeholderColor: C.bg, label: 'BG NEAR',
  },

  // ─── Scene Backgrounds ─────────────────────────────────────────────────────
  {
    key: 'bg_pizzeria_interior',
    path: 'sprites/bg/pizzeria_interior.png',
    width: 320, height: 180,
    placeholderColor: '#996633', label: 'PIZZERIA INT',
  },
  {
    key: 'bg_pizzeria_exterior',
    path: 'sprites/bg/pizzeria_exterior.png',
    width: 320, height: 180,
    placeholderColor: '#996633', label: 'PIZZERIA EXT',
  },
  {
    key: 'bg_client_surface_1',
    path: 'sprites/bg/client_surface_1.png',
    width: 320, height: 180,
    placeholderColor: C.planet, label: 'CLIENT SRF 1',
  },
  {
    key: 'bg_client_surface_2',
    path: 'sprites/bg/client_surface_2.png',
    width: 320, height: 180,
    placeholderColor: C.planet, label: 'CLIENT SRF 2',
  },
  {
    key: 'bg_client_surface_3',
    path: 'sprites/bg/client_surface_3.png',
    width: 320, height: 180,
    placeholderColor: C.planet, label: 'CLIENT SRF 3',
  },
  {
    key: 'bg_side_ice',
    path: 'sprites/bg/side_surface_ice.png',
    width: 320, height: 180,
    placeholderColor: '#aaddff', label: 'SIDE: ICE',
  },
  {
    key: 'bg_side_jungle',
    path: 'sprites/bg/side_surface_jungle.png',
    width: 320, height: 180,
    placeholderColor: '#44aa44', label: 'SIDE: JUNGLE',
  },
  {
    key: 'bg_side_desert',
    path: 'sprites/bg/side_surface_desert.png',
    width: 320, height: 180,
    placeholderColor: '#ddaa44', label: 'SIDE: DESERT',
  },
  {
    key: 'bg_side_lava',
    path: 'sprites/bg/side_surface_lava.png',
    width: 320, height: 180,
    placeholderColor: '#ff4400', label: 'SIDE: LAVA',
  },

  // ─── Obstacles: Asteroids ──────────────────────────────────────────────────
  {
    key: 'asteroid_small_1',
    path: 'sprites/obstacles/asteroid_small_1.png',
    width: 8, height: 8,
    placeholderColor: C.obstacle, label: 'A',
  },
  {
    key: 'asteroid_small_2',
    path: 'sprites/obstacles/asteroid_small_2.png',
    width: 8, height: 8,
    placeholderColor: C.obstacle, label: 'A',
  },
  {
    key: 'asteroid_small_3',
    path: 'sprites/obstacles/asteroid_small_3.png',
    width: 8, height: 8,
    placeholderColor: C.obstacle, label: 'A',
  },
  {
    key: 'asteroid_medium_1',
    path: 'sprites/obstacles/asteroid_medium_1.png',
    width: 16, height: 16,
    placeholderColor: C.obstacle, label: 'AST',
  },
  {
    key: 'asteroid_medium_2',
    path: 'sprites/obstacles/asteroid_medium_2.png',
    width: 16, height: 16,
    placeholderColor: C.obstacle, label: 'AST',
  },
  {
    key: 'asteroid_medium_3',
    path: 'sprites/obstacles/asteroid_medium_3.png',
    width: 16, height: 16,
    placeholderColor: C.obstacle, label: 'AST',
  },
  {
    key: 'asteroid_large_1',
    path: 'sprites/obstacles/asteroid_large_1.png',
    width: 24, height: 24,
    placeholderColor: C.obstacle, label: 'ASTER',
  },
  {
    key: 'asteroid_large_2',
    path: 'sprites/obstacles/asteroid_large_2.png',
    width: 24, height: 24,
    placeholderColor: C.obstacle, label: 'ASTER',
  },
  {
    key: 'asteroid_huge',
    path: 'sprites/obstacles/asteroid_huge.png',
    width: 32, height: 32,
    placeholderColor: C.obstacle, label: 'ASTRD',
  },

  // ─── Obstacles: Space Junk ─────────────────────────────────────────────────
  {
    key: 'junk_satellite',
    path: 'sprites/obstacles/junk_satellite.png',
    width: 12, height: 12,
    placeholderColor: C.obstacle, label: 'SAT',
  },
  {
    key: 'junk_panel',
    path: 'sprites/obstacles/junk_panel.png',
    width: 12, height: 12,
    placeholderColor: C.obstacle, label: 'PNL',
  },
  {
    key: 'junk_canister',
    path: 'sprites/obstacles/junk_canister.png',
    width: 12, height: 12,
    placeholderColor: C.obstacle, label: 'CAN',
  },

  // ─── Hazards ───────────────────────────────────────────────────────────────
  {
    key: 'turret',
    path: 'sprites/hazards/turret.png',
    width: 96, height: 48, frameWidth: 16, frameHeight: 16,
    placeholderColor: C.hazard, label: 'TURRET',
  },
  {
    key: 'projectile',
    path: 'sprites/hazards/projectile.png',
    width: 8, height: 4,
    placeholderColor: C.hazard, label: '•',
  },
  {
    key: 'reticle',
    path: 'sprites/hazards/reticle.png',
    width: 128, height: 32, frameWidth: 32, frameHeight: 32,
    placeholderColor: C.hazard, label: 'AIM',
  },

  // ─── NPCs ──────────────────────────────────────────────────────────────────
  {
    key: 'npc_pizza_boss',
    path: 'sprites/npc/pizza_boss.png',
    width: 160, height: 48, frameWidth: 32, frameHeight: 48,
    placeholderColor: C.npc, label: 'BOSS',
  },
  {
    key: 'npc_mansion_door',
    path: 'sprites/npc/mansion_door.png',
    width: 128, height: 48, frameWidth: 32, frameHeight: 48,
    placeholderColor: C.npc, label: 'DOOR',
  },

  // ─── UI ────────────────────────────────────────────────────────────────────
  {
    key: 'ui_compass_ring',
    path: 'sprites/ui/compass_ring.png',
    width: 24, height: 24,
    placeholderColor: C.ui, label: 'CMPS',
  },
  {
    key: 'ui_compass_needle',
    path: 'sprites/ui/compass_needle.png',
    width: 6, height: 12,
    placeholderColor: C.ui, label: '↑',
  },
  {
    key: 'ui_wordle_grid',
    path: 'sprites/ui/wordle_grid.png',
    width: 96, height: 114,
    placeholderColor: C.ui, label: 'GRID',
  },
  {
    key: 'ui_wordle_tile_correct',
    path: 'sprites/ui/wordle_tile_correct.png',
    width: 16, height: 16,
    placeholderColor: '#538d4e', label: '✓',
  },
  {
    key: 'ui_wordle_tile_present',
    path: 'sprites/ui/wordle_tile_present.png',
    width: 16, height: 16,
    placeholderColor: '#b59f3b', label: '?',
  },
  {
    key: 'ui_wordle_tile_absent',
    path: 'sprites/ui/wordle_tile_absent.png',
    width: 16, height: 16,
    placeholderColor: '#3a3a3c', label: '✗',
  },
  {
    key: 'ui_wordle_tile_empty',
    path: 'sprites/ui/wordle_tile_empty.png',
    width: 16, height: 16,
    placeholderColor: '#222233', label: ' ',
  },
  {
    key: 'ui_banner_accepted',
    path: 'sprites/ui/banner_accepted.png',
    width: 160, height: 20,
    placeholderColor: '#538d4e', label: 'ACCESS GRANTED',
  },
  {
    key: 'ui_banner_denied',
    path: 'sprites/ui/banner_denied.png',
    width: 160, height: 20,
    placeholderColor: '#cc3333', label: 'ACCESS DENIED',
  },
  {
    key: 'ui_banner_escape',
    path: 'sprites/ui/banner_escape.png',
    width: 100, height: 30,
    placeholderColor: '#cc3333', label: 'ESCAPE!',
  },
  {
    key: 'ui_popup_upgrade',
    path: 'sprites/ui/popup_upgrade.png',
    width: 80, height: 50,
    placeholderColor: '#4488ff', label: 'UPGRADE',
  },
  {
    key: 'ui_prompt_land',
    path: 'sprites/ui/prompt_land.png',
    width: 64, height: 10,
    placeholderColor: C.ui, label: '[E] LAND',
  },
  {
    key: 'ui_icon_boost',
    path: 'sprites/ui/icon_boost.png',
    width: 12, height: 12,
    placeholderColor: '#4488ff', label: '⚡',
  },
  {
    key: 'ui_icon_damaged',
    path: 'sprites/ui/icon_damaged.png',
    width: 12, height: 12,
    placeholderColor: '#ff8844', label: '💨',
  },
  {
    key: 'ui_icon_shield',
    path: 'sprites/ui/icon_shield.png',
    width: 12, height: 12,
    placeholderColor: '#44aaff', label: '🛡',
  },
  {
    key: 'ui_icon_nav',
    path: 'sprites/ui/icon_nav.png',
    width: 12, height: 12,
    placeholderColor: '#44ff88', label: '🧭',
  },
  {
    key: 'ui_digits',
    path: 'sprites/ui/digits.png',
    width: 88, height: 10, frameWidth: 8, frameHeight: 10,
    placeholderColor: C.ui, label: '0123456789',
  },
]
