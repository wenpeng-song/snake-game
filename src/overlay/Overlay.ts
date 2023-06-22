import * as Phaser from 'phaser';

import GameScene from '~/scenes/GameScene'
import { dephs, gameWidth } from '~/config'
import Snake from '../objects/Snake';

export default class Overlay {
  private readonly scene: GameScene
  private applesCounterText!: Phaser.GameObjects.BitmapText
  private snakeLengthTexts: Phaser.GameObjects.BitmapText[] = [];
  private timerText!: Phaser.GameObjects.BitmapText
  private graphicsRectangle!: Phaser.GameObjects.Graphics
  private applesCounter: number = 0
  private innerStartX = gameWidth - 118
  private innerStartY = 10
  private spriteSize = 16
  private spriteTextIndent = 4
  private textSize = 18
  private textVerticalIndent = 5
  private readonly rectanglePadding = 5
  private readonly texts: Phaser.GameObjects.BitmapText[]
  private readonly totalTextLines: number

  constructor (scene) {
    this.scene = scene

    // this.addApplesCounter()
    this.addSnakeLength()
    this.addTimer()

    this.texts = [...this.snakeLengthTexts, this.timerText]
    this.totalTextLines = this.texts.length

    this.addRectangle()
  }

  // public incrementApplesCounter () {
  //   this.applesCounterText.setText(
  //     (++this.applesCounter).toString()
  //   )

  //   this.redrawRectangle()
  // }

  private snakeLens = {
    snake: 0,
    snake2: 0,
    snake3: 0
  }
  private resetSnakeLen() {
    for (const key in this.snakeLens) {
      if (Object.prototype.hasOwnProperty.call(this.snakeLens, key)) {
        this.snakeLens[key] = 0;
      }
    }
  }
  public updateSnakeLength () {
    this.resetSnakeLen();
    this.snakeLengthTexts.forEach((snakeLengthText, index) => {
      this.scene.snakeManager.snakes.forEach((snake) => {
        for (var key in this.snakeLens) {
          if (key === snake.name) {
            this.snakeLens[key] = snake.getSnakeLength();
          }
        }
      });
      const scores = Object.values(this.snakeLens);
      snakeLengthText.setText(scores[index].toString());
    })

    this.redrawRectangle()
  }

  public updateTimer () {
    const text = this.scene.timer.getFormated()

    this.timerText.setText(text)
  }

  public getApplesCounter () {
    return this.applesCounter
  }

  // dynamic rectangle around text
  private addRectangle () {
    const graphics = this.scene.add.graphics()
    const { maxWidth, totalHeight } = this.getTextInfo()
    const totalTextVerticalIndent = (this.totalTextLines - 1) * this.textVerticalIndent
    const padding = this.rectanglePadding

    this.graphicsRectangle = graphics
      .fillStyle(0, 0.5)
      .fillRoundedRect(
        // TODO if rectangle size + start pos > gameWidth то сдвигать rectangle на разницу в размере
        this.innerStartX - padding - this.getHalfSpriteSize(),
        this.innerStartY - padding,
        // 5 because text bounds is bad
        5 + this.spriteSize + maxWidth + this.spriteTextIndent + padding * 2,
        totalHeight + totalTextVerticalIndent + padding * 2,
        8
      )
      .setDepth(dephs.overlayRectangle)
  }

  // private addApplesCounter () {
  //   const initApplesCount = this.applesCounter

  //   this.applesCounterText = this.scene.add.bitmapText(
  //     this.getTextX(),
  //     this.innerStartY,
  //     'main-font',
  //     initApplesCount.toString(),
  //     this.textSize
  //   )
  //   .setDepth(dephs.text)
  //   this.scene.add.sprite(
  //     this.innerStartX,
  //     this.innerStartY + this.getHalfSpriteSize(),
  //     'snake',
  //     15
  //   )
  //   .setDepth(dephs.text)
  //   .setDisplaySize(this.spriteSize, this.spriteSize)
  //   .setAngle(20)
  // }

  private addSnakeLength () {
    for (let i = 0; i < this.scene.snakeManager.snakes.length; i++) {
      const snake = this.scene.snakeManager.snakes[i];
      const initSnakeLength = snake.getSnakeLength()
      const textStartY = this.innerStartY + this.getPrevTextIndent(i)
  
      this.snakeLengthTexts.push(this.scene.add.bitmapText(
        this.getTextX(),
        textStartY,
        'main-font',
        initSnakeLength.toString(),
        this.textSize
      )
      .setDepth(dephs.text))
  
      let snakeName = 'snake';
      if (i != 0) {
        snakeName += (i+1);
      }
      this.scene.add.sprite(
        this.innerStartX,
        textStartY + this.getHalfSpriteSize(),
        snakeName,
        4
      )
      .setDepth(dephs.text)
      .setDisplaySize(this.spriteSize, this.spriteSize) 
    }
  }

  private addTimer () {
    const textStartY = this.innerStartY + this.getPrevTextIndent(3)
    const initTimer = '00:00'

    this.timerText = this.scene.add.bitmapText(
      this.getTextX(),
      textStartY,
      'main-font',
      initTimer,
      this.textSize
    )
    .setDepth(dephs.text)
    this.scene.add.sprite(
      this.innerStartX,
      textStartY + this.getHalfSpriteSize(),
      'timer'
    )
    .setDepth(dephs.text)
    .setDisplaySize(this.spriteSize, this.spriteSize)
  }

  private getTextX () {
    return this.innerStartX + this.spriteSize + this.spriteTextIndent
  }

  private getTextInfo () {
    let totalHeight = 0
    let maxWidth

    for (const text of this.texts) {
      const {
        local: {
          height,
          width
        }
      } = text.getTextBounds()

      totalHeight += height
      maxWidth = maxWidth ? Math.max(maxWidth, width) : width
    }

    return {
      maxWidth,
      totalHeight
    }
  }

  private redrawRectangle () {
    this.graphicsRectangle.destroy()
    this.addRectangle()
  }

  private getPrevTextIndent (textLvl: number = 1) {
    return (this.textSize + this.textVerticalIndent) * textLvl
  }

  private getHalfSpriteSize () {
    return this.spriteSize / 2
  }
}
