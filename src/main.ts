import { GameLoop } from '@engine/core/GameLoop'
import { SceneManager } from '@engine/core/SceneManager'
import { GAME_HEIGHT, GAME_WIDTH, Renderer } from '@engine/rendering/Renderer'
import { InputManager } from '@engine/input/InputManager'
import { AssetLoader } from '@engine/assets/AssetLoader'
import { MainMenuScene } from '@game/scenes/MainMenuScene'
import { assetManifest } from '@game/data/assetManifest'
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

  scenes.push(new MainMenuScene(scenes, input, assets))

  const loop = new GameLoop(scenes, renderer, input)
  loop.start()
}

boot()
