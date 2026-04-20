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
  confirm: ['Enter'],
  cancel:  ['Escape'],
  land:    ['KeyE'],
  shoot:   ['Space'],
})
const assets = new AssetLoader()

const BASE = import.meta.env.BASE_URL
const snd = (file: string) => `${BASE}assets/sounds/${file}`

const audio = new AudioManager()
audio.register('music_menu',   { src: snd('music_menu.mp3'),   loop: true,  volume: 0.5 })
audio.register('music_space',  { src: snd('music_space.mp3'),  loop: true,  volume: 0.5 })
audio.register('music_tense',  { src: snd('music_tense.mp3'),  loop: true,  volume: 0.5 })
audio.register('thrust',       { src: snd('thrust.wav'),       loop: true,  volume: 0.8 })
audio.register('turret_alarm', { src: snd('turret_alarm.wav'), loop: true,  volume: 0.9 })
audio.register('speed',        { src: snd('speed.wav'),        loop: true,  volume: 0.08 })
audio.register('hit',          { src: snd('hit.wav') })
audio.register('laser',        { src: snd('laser.wav') })
audio.register('land',         { src: snd('land.wav') })
audio.register('pickup',       { src: snd('pickup.wav') })
audio.register('confirm',      { src: snd('confirm.wav') })
audio.register('success',      { src: snd('success.wav') })
audio.register('wordle_key',   { src: snd('wordle_key.wav') })
audio.register('wordle_win',   { src: snd('wordle_win.wav') })
audio.register('wordle_fail',  { src: snd('wordle_fail.wav') })
audio.register('shield_hit',   { src: snd('shield_hit.wav') })
audio.register('game_over',    { src: snd('gameover.mp3') })

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
