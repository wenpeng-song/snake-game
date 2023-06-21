import * as Phaser from 'phaser';

import gameConfig, {gameContainer, overlay, pauseBtn, restartBtn, debugBtn, debugGrid } from '~/config'

export default class Game extends Phaser.Game {
  constructor (GameConfig: GameConfig) {
    super(GameConfig)

    // or like in the canvasContainer width and height
    gameContainer.style.width = 'unset'
    gameContainer.style.height = 'unset'
  }

  public hideOverlay () {
    if (!overlay) {
      return
    }
    overlay.classList.add('game__overlay--hidden')
  }

  public showOverlay () {
    if (!overlay) {
      return
    }
    overlay.classList.remove('game__overlay--hidden')
  }
}

window.addEventListener('load', () => {
  window.game = new Game(gameConfig)
})

if (pauseBtn) {
  pauseBtn.addEventListener('click', () => {
    const scene = window.game.scene.getScene('GameScene')
    const method = scene.sys.isPaused() ? 'resume' : 'pause'
    const datasetKey = scene.sys.isPaused() ? 'pause' : 'resume'

    if (pauseBtn) {
      pauseBtn.textContent = pauseBtn.dataset[datasetKey] || null
    }

    scene.sys[method]()
  })
}
if (restartBtn) {
  restartBtn.addEventListener('click', () => {
    window.game.scene.start('GameScene')
  })
}
if (debugBtn) {
  debugBtn.addEventListener('click', () => {
    if (debugGrid) {
      const isDebug = [undefined, '0'].includes(debugGrid.dataset.hide)

      // '0' or '1'
      debugGrid.dataset.hide = (+isDebug).toString()
      debugGrid.classList.toggle('game__grid--hidden', !isDebug)

      window.game.events.emit('app_toggle_debug', isDebug)
    }
  })
}
