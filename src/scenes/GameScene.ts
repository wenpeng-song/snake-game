import * as Phaser from 'phaser';

import AppleBonus from '~/objects/bonus/AppleBonus'
import Snake from '~/objects/Snake'
import { ceilsXCount, ceilsYCount, ceil, gameWidth, gameHeight, dephs } from '~/config'
import Overlay from '~/overlay/Overlay'
import Timer from '~/overlay/Timer'
import LocalStorage from '~/storage/LocalStorage'
import AbstractStorage from '~/storage/AbstractStorage'
import SoundManager from '~/managers/SoundManager'
import PlumBonus from '~/objects/bonus/PlumBonus'
import PearBonus from '~/objects/bonus/PearBonus'
import GrapesBonus from '~/objects/bonus/GrapesBonus'
import PeachBonus from '~/objects/bonus/PeachBonus'
import ApricotBonus from '~/objects/bonus/ApricotBonus'
import SnakeManager from '../managers/SnakeManager';

export default class GameScene extends Phaser.Scene {

  public snakeManager!: SnakeManager
  public overlay!: Overlay
  public timer!: Timer
  public storage!: AbstractStorage
  public soundManager!: SoundManager

  private worldIterations = 0
  // TODO хранить в массиве сами бонусы, потом проходится по ним для получения позиций
  private bonusesPositions: any[] = []

  // texts
  private fpsText!: Phaser.GameObjects.BitmapText

  constructor () {
    super({
      key: 'GameScene'
    })
  }

  public init (): void {
    this.timer = new Timer(() => {
      this.overlay.updateTimer()
    })
    this.storage = new LocalStorage()
    this.soundManager = new SoundManager()
    this.snakeManager = new SnakeManager(this, this.storage, this.soundManager);
    this.snakeManager.initSnake(2);
    this.overlay = new Overlay(this)

    window.game.showOverlay()

    this.addFPSText()
    this.addEventsListeners()
  }

  public create (): void {
    const sprite = this.add.tileSprite(0, 0, gameWidth * 2, gameHeight * 2, 'background')

    sprite.setDepth(dephs.background)

    this.soundManager.add([
      this.sound.add('eat1'),
      this.sound.add('eat2'),
      this.sound.add('eat3'),
      this.sound.add('eat4'),
      this.sound.add('eat5'),
      this.sound.add('dead')
    ])
  }

  // time - elapsed time in milliseconds (pause does not affect!)
  public update (time): void {
    const snakeMoveIterationsRange = 15 // - Math.floor(this.timer.getSeconds() / 4)
    const bonusIterationsRange = 50

    this.worldIterations += 1

    if (this.worldIterations % bonusIterationsRange === 0) {
      this.addBonus()
    }
    if (this.worldIterations % snakeMoveIterationsRange === 0) {
      this.snakeManager.update(time);
      this.snakeManager.checkTakeBonus(this.bonusesPositions);
    }
    this.snakeManager.checkTaran();

    this.fpsText.setText(this.getFPS())
  }

  public getRandomCeil () {
    return this.getCeilFullPos(
      this.getRandomInt(1, ceilsXCount), this.getRandomInt(1, ceilsYCount)
    )
  }

  /**
   * Get ceil x coordinate by index
   * @param index from 1
   */
  public getCeilXPos (index: number): number {
    return index * ceil - (ceil / 2)
  }

  /**
   * Get ceil y coordinate by index
   * @param index from 1
   */
  public getCeilYPos (index: number): number {
    return index * ceil - (ceil / 2)
  }

  public getCeilFullPos (xIndex, yIndex) {
    return {
      x: this.getCeilXPos(xIndex),
      y: this.getCeilYPos(yIndex)
    }
  }

  // TODO bonus does not appear on the snake
  private addBonus () {
    const ceilPos = this.getRandomCeil()
    const bonuses = [AppleBonus, PlumBonus, PearBonus, GrapesBonus, PeachBonus, ApricotBonus]
    const randomBonus = bonuses[Math.round(Math.random() * bonuses.length - 1)]

    if (randomBonus) {
      const apple = new randomBonus(this, ceilPos)
      this.bonusesPositions.push({ ...ceilPos, bonus: apple })
    }
  }


  private getRandomInt (min: number, max: number): number {
    // let rand = Math.round(min - 0.5 + Math.random() * (max - min + 1))
    // return rand

    return Phaser.Math.RND.between(min, max)
  }

  private addEventsListeners () {
    this.events.on('pause', () => {
      this.timer.pause()
    })
    this.events.on('resume', () => {
      this.timer.resume()
    })
    window.game.events.on('app_toggle_debug', (isDebug: boolean) => {
      this.fpsText.setVisible(isDebug)
    })
  }

  private onDead () {
    const score = this.overlay.getApplesCounter()
    const maxScore = this.storage.get('max-score')

    if (score > maxScore || maxScore === undefined) {
      this.storage.set('max-score', score)
    }

    this.soundManager.play('dead')
    this.scene.start('MainMenuScene')
  }

  private getFPS () {
    return 'FPS: ' + window.game.loop.actualFps.toFixed(0).toString()
  }

  private addFPSText () {
    this.fpsText = this.add.bitmapText(
      2,
      2,
      'main-font',
      this.getFPS(),
      8
    )
    .setDepth(dephs.text)
    .setVisible(false) // change if necessary
  }
}
