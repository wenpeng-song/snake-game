import Game from '~/Game'

declare global {
  interface Window {
    game: Game,
    cordova: boolean
  }
}
