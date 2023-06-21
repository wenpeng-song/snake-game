import * as Phaser from 'phaser';

import Snake from '~/objects/Snake'
import { ceilsXCount, ceilsYCount, ceil, gameWidth, gameHeight, dephs } from '~/config'
import AbstractStorage from '~/storage/AbstractStorage'
import SoundManager from '~/managers/SoundManager'
import GameScene from '../scenes/GameScene';

export default class SnakeManager {
  private scene!: GameScene
  public snakes: Snake[] = [];
  public storage!: AbstractStorage
  public soundManager!: SoundManager

  constructor (scene, storage, soundManager) {
    this.scene = scene;
    this.storage = storage;
    this.soundManager = soundManager;
  }

  public initSnake(count = 1) {
    let rCount = count > 3 ? 3 : (count < 1 ? 1 : count);

    let leftStartX = 0;
    let leftStepX = 0;
    const startY = this.scene.getCeilYPos(Math.floor(ceilsYCount / 2));
    let cursors = {
      cursors0 : null,
      cursors1 : null,
      cursors2 : null,
    }
    switch (count) {
      case 1:
        {
          leftStartX = this.scene.getCeilXPos(Math.floor(ceilsXCount / 4));
          leftStepX = 0;
          cursors.cursors0 = this.scene.input.keyboard.createCursorKeys()
        }
        break;
      case 2:
        {
          leftStartX = this.scene.getCeilXPos(Math.floor(ceilsXCount / 4));
          leftStepX = this.scene.getCeilXPos(Math.floor(ceilsXCount / 2))
          cursors.cursors0 = this.scene.input.keyboard.addKeys({
            up: "W",
            down: "S",
            left: "A",
            right: "D",
          });
          cursors.cursors1 = this.scene.input.keyboard.createCursorKeys()
        }
        break;
      case 3:
        {
          leftStartX = this.scene.getCeilXPos(Math.floor(ceilsXCount / 4));
          leftStepX = this.scene.getCeilXPos(Math.floor(ceilsXCount / 4))
          cursors.cursors0 = this.scene.input.keyboard.addKeys({
            up: "W",
            down: "S",
            left: "A",
            right: "D",
          });
          cursors.cursors1 = this.scene.input.keyboard.addKeys({
            up: "I",
            down: "K",
            left: "J",
            right: "L",
          });
          cursors.cursors2 = this.scene.input.keyboard.createCursorKeys()

        }
        break;
      default:
        break;
    }
    for (let i = 0; i < rCount; i++) {
      let name = 'snake';

      if (i != 0) {
        name += (i+1);
      }
      let snake = new Snake(this.scene, leftStartX + i*leftStepX, startY, name, cursors[`cursors${i}`]);
      this.snakes.push(snake);
    }
    this.addEventsListeners()
  }

  // time - elapsed time in milliseconds (pause does not affect!)
  public update (time): void {
    this.handleInput()
    this.snakes.forEach((snake: Snake) => {
      snake.move();
      if (snake.isDead()) {
        this.onDead(snake);
      }
    })
    // if (this.snake.isDead()) {
    //   this.onDead()
    // }
  }

  public handleInput (): void {
    this.snakes.forEach((snake: Snake) => {
      const wantMoveDir = this.getDirByInput(snake.cursors);
      snake.setDir(wantMoveDir);
    })
  }

  public getDirByInput (cursors, presedKey?) {
    const directions = [Snake.DIRECTIONS.UP, Snake.DIRECTIONS.RIGHT, Snake.DIRECTIONS.DOWN, Snake.DIRECTIONS.LEFT]
    // Same as below:
    for (const button of directions) {
      if ((cursors[button] && cursors[button].isDown)) {
        return button
      }
    }
    // Same as above:
    // switch (true) {
    //   case (this.cursors.up && this.cursors.up.isDown) || presedKey === 'w':
    //     return this.snake.DIRECTIONS.UP
    //   case (this.cursors.right && this.cursors.right.isDown) || presedKey === 'd':
    //     return this.snake.DIRECTIONS.RIGHT
    //   case (this.cursors.down && this.cursors.down.isDown) || presedKey === 's':
    //     return this.snake.DIRECTIONS.DOWN
    //   case (this.cursors.left && this.cursors.left.isDown) || presedKey === 'a':
    //     return this.snake.DIRECTIONS.LEFT
    // }
  }

  private checkTaran () {
    // const taran = this.snake.bodyPartsPositions
    //   .slice(0, -1)
    //   .find(i =>
    //     i.x === this.snake.snakeHeadX && i.y === this.snake.snakeHeadY
    //   )

    // this.snake.setDead(taran)
  }

  public checkTakeBonus (bonusesPositions: any[]) {
    const snakeHalfSize = this.snakes[0].size / 2

    let snake = null;
    const bonusPos = bonusesPositions.find(({ x: bonusX, y: bonusY }) => {
      snake =  this.snakes.find(snake => {
        snake.bodyPartsPositions.some(({ x: bodyX, y: bodyY }: any) =>
        bonusX >= bodyX - snakeHalfSize &&
        bonusY >= bodyY - snakeHalfSize &&
        bonusX <= bodyX + snakeHalfSize &&
        bonusY <= bodyY + snakeHalfSize
      )})
    });

    if (bonusPos && snake) {
      const bonus = bonusPos.bonus
      const randomSoundKey = 1 + Math.round(Math.random() * (5 - 1))

      let index = bonusesPositions.indexOf(bonusPos);
      bonusesPositions.splice(index, 1);

      bonus.onCollisionWithSnake()
      snake.onTakenBonus(bonus)
      this.soundManager.play('eat' + randomSoundKey)
    }
  }

  // private checkCollision (): void {
  //   this.checkTakeBonus()
  //   this.checkTaran()
  // }

  private addEventsListeners () {
    this.scene.input.keyboard.on('keydown', ({ key }) => {
      const snakeCnt = this.snakes.length;
      this.snakes.forEach((snake: Snake) => {
        const cursors = snake.cursors;
        snake.setDir(this.getDirByInput(cursors, key));
      });
    })

    // multiple players cannot using swipe;
    if (this.snakes.length === 1) {
      window.game.events.on('swipe', (dir) => {
        this.snakes[0].setDir(dir);
      })
    }
  }

  private onDead(snake: Snake) {
    const delay_to_came_back = 3000; // 3s
    // after {delay_to_came_back} the snake came back to life
    setTimeout(() => {
      const ceilPos = this.scene.getRandomCeil();

      let newSnake = new Snake(this, ceilPos.x, ceilPos.y, snake.name, snake.cursors);
      this.snakes.splice(this.snakes.indexOf(snake), 1);
      this.snakes.push(newSnake);
    }, delay_to_came_back);
  }

  // private onDead () {
    // const score = this.overlay.getApplesCounter()
    // const maxScore = this.storage.get('max-score')

    // if (score > maxScore || maxScore === undefined) {
    //   this.storage.set('max-score', score)
    // }

    // this.soundManager.play('dead')
    // this.scene.start('MainMenuScene')
  // }

}
