import { GameLoop } from '@engine/core/GameLoop'
import { SceneManager } from '@engine/core/SceneManager'
import { GAME_HEIGHT, GAME_WIDTH, Renderer } from '@engine/rendering/Renderer'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { AudioManager } from '@engine/audio/AudioManager'
import { MainMenuScene } from '@game/scenes/MainMenuScene'
import { assetManifest } from '@game/data/assetManifest'
import { gameState, OUTFIT_KEYS } from '@game/data/GameState'
import { FONT_SM } from '@game/data/ui'
import '@game/data/debug'

const container = document.getElementById('app')!

const renderer = new Renderer(container)
const scenes = new SceneManager()
const input = new InputManager({
  up:      ['ArrowUp',    'KeyW'],
  down:    ['ArrowDown',  'KeyS'],
  left:    ['ArrowLeft',  'KeyA'],
  right:   ['ArrowRight', 'KeyD'],
  confirm: ['Enter',      'Space'],
  cancel:  ['Escape'],
  land:    ['KeyE'],
})
const assets = new AssetLoader()

const audio = new AudioManager()
audio.register('music_menu',   { src: '/assets/sounds/music_menu.mp3',   loop: true,  volume: 0.5 })
audio.register('music_space',  { src: '/assets/sounds/music_space.mp3',  loop: true,  volume: 0.5 })
audio.register('music_tense',  { src: '/assets/sounds/music_tense.mp3',  loop: true,  volume: 0.5 })
audio.register('thrust',       { src: '/assets/sounds/thrust.wav',       loop: true,  volume: 0.8 })
audio.register('turret_alarm', { src: '/assets/sounds/turret_alarm.wav', loop: true,  volume: 0.9 })
audio.register('speed',        { src: '/assets/sounds/speed.wav',        loop: true,  volume: 0.08 })
audio.register('hit',          { src: '/assets/sounds/hit.wav' })
audio.register('laser',        { src: '/assets/sounds/laser.wav' })
audio.register('land',         { src: '/assets/sounds/land.wav' })
audio.register('pickup',       { src: '/assets/sounds/pickup.wav' })
audio.register('confirm',      { src: '/assets/sounds/confirm.wav' })
audio.register('success',      { src: '/assets/sounds/success.wav' })
audio.register('wordle_key',   { src: '/assets/sounds/wordle_key.wav' })
audio.register('wordle_win',   { src: '/assets/sounds/wordle_win.wav' })
audio.register('wordle_fail',  { src: '/assets/sounds/wordle_fail.wav' })
audio.register('shield_hit',   { src: '/assets/sounds/shield_hit.wav' })
audio.register('game_over',    { src: '/assets/sounds/gameover.mp3' })

window.addEventListener('keydown', (e) => {
  if (e.code === 'Digit1' && gameState.unlockedOutfits.length > 0) {
    const options: Array<string | null> = [null, ...gameState.unlockedOutfits]
    const idx = options.indexOf(gameState.activeOutfit)
    gameState.activeOutfit = options[(idx + 1) % options.length]
  }
})

async function boot() {
  await document.fonts.load(FONT_SM)

  assets.loadManifest(assetManifest)

  await assets.waitAll((loaded, total) => {
    // Loading progress drawn directly on canvas
    const ctx = renderer.ctx
    renderer.clear()
    ctx.fillStyle = '#0a0a1a'
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
    ctx.fillStyle = '#ffffff'
    ctx.font = FONT_SM
    ctx.textAlign = 'center'
    ctx.fillText('LOADING...', 160, 85)
    const barW = Math.floor((loaded / total) * 200)
    ctx.fillStyle = '#334466'
    ctx.fillRect(60, 95, 200, 6)
    ctx.fillStyle = '#4488ff'
    ctx.fillRect(60, 95, barW, 6)
  })

  scenes.push(new MainMenuScene(scenes, input, assets, audio))

  const loop = new GameLoop(scenes, renderer, input)
  loop.start()
}

boot()
