export interface IBall {
    x: number,
    y: number,
    dx: number,
    dy: number,
    dir: number,
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
    leftPaddle: IPaddle,
    rightPaddle: IPaddle,
    status: 'waiting' | 'playing' | 'ended'
    players: {plr1Socket: string | null, plr2Socket: string | null},
    playersNb: number
    winner: string | null;
}
