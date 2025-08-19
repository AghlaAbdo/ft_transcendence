import {
  generateGameState,
  paddleMoveUp,
  paddleMoveDown,
  resetBallPos,
} from '../../game/gameState';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PADDLE_HEIGHT,
  PADDLE_SPEED,
  BALL_RADIUS,
  BALL_SPEED,
} from '../../config/game';
import { IGameState } from '../../types/game';

// Mock Math.random() for deterministic ball initial direction and angle
// This is crucial for testing functions that rely on randomness.
const mockMath = Object.create(global.Math);
mockMath.random = jest.fn();
global.Math = mockMath;

describe('Game Core Functions', () => {
  // Reset the mock for Math.random before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (Math.random as jest.Mock).mockReturnValue(0.6);
  });

  // --- generateGameState Tests ---
  describe('generateGameState', () => {
    test('should correctly initialize game state with given ID and predictable ball values', () => {
      const gameId = 'test-game-123';
      (Math.random as jest.Mock)
        .mockReturnValueOnce(0.6) // For direction: 0.6 > 0.5 -> dir = -1
        .mockReturnValueOnce(0.4); // For angle: 0.4 * (PI/2) - PI/4 = 0.2PI - 0.25PI = -0.05PI (small negative angle)

      const gameState = generateGameState(gameId);

      expect(gameState.id).toBe(gameId);
      expect(gameState.status).toBe('waiting');
      expect(gameState.playersNb).toBe(1);
      expect(gameState.players).toEqual({ plr1Socket: null, plr2Socket: null });
      expect(gameState.winner).toBeNull();

      // Check paddle initial positions
      expect(gameState.leftPaddle.y).toBe(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
      expect(gameState.rightPaddle.y).toBe(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
      expect(gameState.leftPaddle.score).toBe(0);
      expect(gameState.rightPaddle.score).toBe(0);

      // Check ball initial position and direction (with mocked random)
      expect(gameState.ball.x).toBe(GAME_WIDTH / 2);
      expect(gameState.ball.y).toBe(GAME_HEIGHT / 2);
      expect(gameState.ball.radius).toBe(BALL_RADIUS);
      expect(gameState.ball.dir).toBe(-1);
      const expectedAngle = 0.4 * (Math.PI / 2) - Math.PI / 4; // -0.05 * Math.PI
      expect(gameState.ball.dx).toBeCloseTo(
        BALL_SPEED * Math.cos(expectedAngle) * -1,
      ); // dir is -1
      expect(gameState.ball.dy).toBeCloseTo(
        BALL_SPEED * Math.sin(expectedAngle),
      );
    });

    test('should correctly initialize ball direction to 1', () => {
      const gameId = 'test-game-reverse';
      (Math.random as jest.Mock)
        .mockReturnValueOnce(0.1) // For direction: 0.1 < 0.5 -> dir = 1
        .mockReturnValueOnce(0.5); // For angle: 0.5 * (PI/2) - PI/4 = 0

      const gameState = generateGameState(gameId);
      expect(gameState.ball.dir).toBe(1);
      expect(gameState.ball.dx).toBeCloseTo(BALL_SPEED * Math.cos(0) * 1); // dir is 1
    });
  });

  // --- paddleMoveUp Tests ---
  describe('paddleMoveUp', () => {
    let gameState: IGameState;

    beforeEach(() => {
      // Ensure a fresh game state for each paddle move test
      gameState = generateGameState('temp-game-id');
      (Math.random as jest.Mock).mockReturnValue(0.6); // Reset mock for generateGameState
    });

    test('should move leftPaddle up by PADDLE_SPEED', () => {
      const initialY = gameState.leftPaddle.y;
      paddleMoveUp(gameState, 'player1');
      expect(gameState.leftPaddle.y).toBe(initialY - PADDLE_SPEED);
    });

    test('should not move leftPaddle above top boundary', () => {
      gameState.leftPaddle.y = 10; // Set close to top
      paddleMoveUp(gameState, 'player1');
      expect(gameState.leftPaddle.y).toBe(0); // Should be exactly 0
      paddleMoveUp(gameState, 'player1'); // Try to move again
      expect(gameState.leftPaddle.y).toBe(0); // Should remain at 0
    });

    test('should move rightPaddle up by PADDLE_SPEED', () => {
      const initialY = gameState.rightPaddle.y;
      paddleMoveUp(gameState, 'player2');
      expect(gameState.rightPaddle.y).toBe(initialY - PADDLE_SPEED);
    });

    test('should not move rightPaddle above top boundary', () => {
      gameState.rightPaddle.y = 5; // Set close to top
      paddleMoveUp(gameState, 'player2');
      expect(gameState.rightPaddle.y).toBe(0); // Should be exactly 0
      paddleMoveUp(gameState, 'player2'); // Try to move again
      expect(gameState.rightPaddle.y).toBe(0); // Should remain at 0
    });

    test('should not move paddle if playerRole is not recognized (e.g., spectator)', () => {
      const initialLeftY = gameState.leftPaddle.y;
      const initialRightY = gameState.rightPaddle.y;
      paddleMoveUp(gameState, 'spectator'); // Invalid role
      expect(gameState.leftPaddle.y).toBe(initialLeftY);
      expect(gameState.rightPaddle.y).toBe(initialRightY);
    });
  });

  // --- paddleMoveDown Tests ---
  describe('paddleMoveDown', () => {
    let gameState: IGameState;

    beforeEach(() => {
      gameState = generateGameState('temp-game-id');
      (Math.random as jest.Mock).mockReturnValue(0.6); // Reset mock for generateGameState
    });

    test('should move leftPaddle down by PADDLE_SPEED', () => {
      const initialY = gameState.leftPaddle.y;
      paddleMoveDown(gameState, 'player1');
      expect(gameState.leftPaddle.y).toBe(initialY + PADDLE_SPEED);
    });

    test('should not move leftPaddle below bottom boundary', () => {
      gameState.leftPaddle.y = GAME_HEIGHT - PADDLE_HEIGHT - 10; // Set close to bottom
      paddleMoveDown(gameState, 'player1');
      expect(gameState.leftPaddle.y).toBe(GAME_HEIGHT - PADDLE_HEIGHT); // Should be at boundary
      paddleMoveDown(gameState, 'player1'); // Try to move again
      expect(gameState.leftPaddle.y).toBe(GAME_HEIGHT - PADDLE_HEIGHT); // Should remain at boundary
    });

    test('should move rightPaddle down by PADDLE_SPEED', () => {
      const initialY = gameState.rightPaddle.y;
      paddleMoveDown(gameState, 'player2');
      expect(gameState.rightPaddle.y).toBe(initialY + PADDLE_SPEED);
    });

    test('should not move rightPaddle below bottom boundary', () => {
      gameState.rightPaddle.y = GAME_HEIGHT - PADDLE_HEIGHT - 5; // Set close to bottom
      paddleMoveDown(gameState, 'player2');
      expect(gameState.rightPaddle.y).toBe(GAME_HEIGHT - PADDLE_HEIGHT); // Should be at boundary
      paddleMoveDown(gameState, 'player2'); // Try to move again
      expect(gameState.rightPaddle.y).toBe(GAME_HEIGHT - PADDLE_HEIGHT); // Should remain at boundary
    });

    test('should not move paddle if playerRole is not recognized (e.g., spectator)', () => {
      const initialLeftY = gameState.leftPaddle.y;
      const initialRightY = gameState.rightPaddle.y;
      paddleMoveDown(gameState, 'spectator'); // Invalid role
      expect(gameState.leftPaddle.y).toBe(initialLeftY);
      expect(gameState.rightPaddle.y).toBe(initialRightY);
    });
  });

  // --- resetBallPos Tests ---
  describe('resetBallPos', () => {
    let gameState: IGameState;

    beforeEach(() => {
      gameState = generateGameState('temp-game-id');
      // Set an initial state for the ball that is NOT at reset position
      gameState.ball = {
        x: 100,
        y: 100,
        dx: 10,
        dy: -10,
        dir: 1,
        radius: BALL_RADIUS,
      };
      // Ensure Math.random() is predictable for resetBallPos's angle calculation
      (Math.random as jest.Mock).mockReturnValueOnce(0.25); // For angle: 0.25 * (PI/2) - PI/4 = 0
    });

    test('should reset ball to center of the game area', () => {
      resetBallPos(gameState);
      expect(gameState.ball.x).toBe(GAME_WIDTH / 2);
      expect(gameState.ball.y).toBe(GAME_HEIGHT / 2);
      expect(gameState.ball.radius).toBe(BALL_RADIUS);
    });

    test('should reverse ball direction (dir property)', () => {
      // Test when initial dir is 1
      gameState.ball.dir = 1;
      resetBallPos(gameState);
      expect(gameState.ball.dir).toBe(-1);

      // Test when initial dir is -1
      gameState.ball.dir = -1; // Set it back for the next test scenario
      resetBallPos(gameState);
      expect(gameState.ball.dir).toBe(1); // Should reverse from -1 to 1
    });

    test('should calculate new dx and dy based on BALL_SPEED and new random angle', () => {
      gameState.ball.dir = 1; // Make sure ball.dir is set to a known value
      (Math.random as jest.Mock).mockReturnValueOnce(0.25); // For angle: 0.5 * (PI/2) - PI/4 = 0

      resetBallPos(gameState);
      const expectedAngle = 0.25 * (Math.PI / 2) - Math.PI / 4; // Based on the mock
      // dx should be BALL_SPEED * cos(0) * new_dir (which is -1 based on initial 1)
      expect(gameState.ball.dx).toBeCloseTo(
        BALL_SPEED * Math.cos(expectedAngle) * gameState.ball.dir,
      ); // After reset, dir will be -1
      expect(gameState.ball.dy).toBeCloseTo(
        BALL_SPEED * Math.sin(expectedAngle),
      );
    });
  });
});
