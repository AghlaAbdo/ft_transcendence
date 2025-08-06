export interface IBall {
    x: number,
    y: number,
    dx: number,
    dy: number,
    radius: number
}

export interface IPaddle {
    y: number,
    height: number,
    width: number,
    score: number
}

export interface IGameState {
    ball: IBall,
    paddle1: IPaddle,
    paddle2: IPaddle,
    status: 'waiting' | 'playing' | 'ended'
    players: { [socketId: string]: 'player1' | 'player2' | 'spectator' },
    playersNb: number
}
