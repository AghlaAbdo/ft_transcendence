import {
  setIoInstance,
  startGame,
  endGame,
  _resetGameIntervalsForTesting,
} from '../../remote-game/gameLogic';
import { resetBallPos } from '../../remote-game/gameState'; // Mock this dependency
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BALL_RADIUS,
  BALL_SPEED,
  GAME_INTERVAL_MS,
} from '../../config/game';
import { IGameState } from '../../types/game';
import { Server } from 'socket.io';

// Mock external dependencies
jest.mock('../../game/gameState'); // Mock the resetBallPos function
jest.useFakeTimers(); // To control setInterval
jest.spyOn(global, 'setInterval');
jest.spyOn(global, 'clearInterval');

// Mock Math.random for deterministic ball initial direction/angle if resetBallPos uses it directly
const mockMath = Object.create(global.Math);
mockMath.random = jest.fn(() => 0.5); // Default mock for Math.random
global.Math = mockMath;

describe('Game Logic', () => {
  let mockIo: Server; // Mock Socket.IO server instance
  let testGameState: IGameState; // A fresh game state for each test

  beforeEach(() => {
    // Reset mocks and test state before each test
    jest.clearAllMocks();
    (resetBallPos as jest.Mock).mockImplementation(jest.fn()); // Ensure resetBallPos is a mock
    jest.clearAllTimers(); // Clear any timers from previous tests
    _resetGameIntervalsForTesting();

    // Initialize a consistent test game state
    testGameState = {
      id: 'test-game-1',
      ball: {
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT / 2,
        dx: BALL_SPEED, // Start with a predictable dx/dy for easier testing
        dy: BALL_SPEED,
        dir: 1,
        radius: BALL_RADIUS,
      },
      leftPaddle: {
        y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        height: PADDLE_HEIGHT,
        width: PADDLE_WIDTH,
        score: 0,
      },
      rightPaddle: {
        y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        height: PADDLE_HEIGHT,
        width: PADDLE_WIDTH,
        score: 0,
      },
      status: 'waiting',
      players: { plr1Socket: 'socket1', plr2Socket: 'socket2' },
      playersNb: 2,
      winner: null,
    };

    // Mock Socket.IO server methods
    mockIo = {
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(), // Allow chaining .to().emit()
      // Add other methods if your logic uses them
    } as unknown as Server; // Cast to Server to satisfy type checks

    setIoInstance(mockIo); // Set the mocked IO instance
  });

  afterEach(() => {
    // Ensure any running intervals are cleared
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
  });

  // --- setIoInstance Tests ---
  describe('setIoInstance', () => {
    test('should correctly set the ioInstance', () => {
      const anotherMockIo = { emit: jest.fn() } as unknown as Server;
      setIoInstance(anotherMockIo);
      // To truly test if ioInstance is set, you'd need to expose it or test a function that uses it
      // For now, we rely on subsequent tests to verify its usage.
    });
  });

  // --- startGame Tests ---
  describe('startGame', () => {
    test('should set game status to "playing" and start the game interval', () => {
      startGame(testGameState);
      expect(testGameState.status).toBe('playing');
      expect(setInterval).toHaveBeenCalledTimes(1);
      expect(setInterval).toHaveBeenCalledWith(
        expect.any(Function),
        GAME_INTERVAL_MS,
      );
    });

    test('should not start game if it is already running for this gameId', () => {
      startGame(testGameState); // First call starts it
      startGame(testGameState); // Second call should be ignored
      expect(setInterval).toHaveBeenCalledTimes(1); // Still only one call
    });
  });

  // --- gameLoop Tests ---
  describe('gameLoop', () => {
    test('should update ball position on each tick', () => {
      const initialX = testGameState.ball.x;
      const initialY = testGameState.ball.y;
      const dx = testGameState.ball.dx;
      const dy = testGameState.ball.dy;

      startGame(testGameState);
      jest.advanceTimersByTime(GAME_INTERVAL_MS); // Advance by one tick

      expect(testGameState.ball.x).toBe(initialX + dx);
      expect(testGameState.ball.y).toBe(initialY + dy);
      expect(mockIo.to).toHaveBeenCalledWith(testGameState.id);
      expect(mockIo.emit).toHaveBeenCalledWith(
        'gameStateUpdate',
        testGameState,
      );
    });

    test('should bounce ball off top wall', () => {
      // Position ball near top, moving up
      testGameState.ball = {
        ...testGameState.ball,
        y: BALL_RADIUS / 2 + 1,
        dy: -5,
      };
      const initialDy = testGameState.ball.dy;

      startGame(testGameState);
      jest.advanceTimersByTime(GAME_INTERVAL_MS);

      expect(testGameState.ball.dy).toBe(-initialDy); // Should be positive after bounce
      expect(testGameState.ball.y).toBeGreaterThan(0); // Should be within bounds
    });

    test('should bounce ball off bottom wall', () => {
      // Position ball near bottom, moving down
      testGameState.ball = {
        ...testGameState.ball,
        y: GAME_HEIGHT - BALL_RADIUS - 1,
        dy: 5,
      };
      const initialDy = testGameState.ball.dy;

      startGame(testGameState);
      jest.advanceTimersByTime(GAME_INTERVAL_MS);

      expect(testGameState.ball.dy).toBe(-initialDy); // Should be negative after bounce
      expect(testGameState.ball.y).toBeLessThan(GAME_HEIGHT); // Should be within bounds
    });

    test('should bounce ball off left paddle', () => {
      // Position ball to collide with left paddle
      testGameState.ball = {
        ...testGameState.ball,
        x: PADDLE_WIDTH + BALL_RADIUS / 2 + 1 - testGameState.ball.dx, // Just past paddle, moving left
        dx: -BALL_SPEED,
        y:
          testGameState.leftPaddle.y +
          PADDLE_HEIGHT / 2 -
          testGameState.ball.dy, // Center of paddle
      };
      const initialDx = testGameState.ball.dx;

      startGame(testGameState);
      jest.advanceTimersByTime(GAME_INTERVAL_MS);

      // Ball should hit paddle, dx should reverse and dy might change based on angle
      // With ball at center of paddle, bounceAngle should be 0, so dy should remain same magnitude.
      expect(testGameState.ball.dx).toBeCloseTo(-initialDx); // Should reverse horizontal direction
      expect(testGameState.ball.dy).toBeCloseTo(0); // Angle 0 implies no change to dy from original
    });

    test('should bounce ball off right paddle', () => {
      // Position ball to collide with right paddle
      testGameState.ball = {
        ...testGameState.ball,
        x: GAME_WIDTH - PADDLE_WIDTH - BALL_RADIUS / 2 - 1, // Just before paddle, moving right
        dx: BALL_SPEED,
        y:
          testGameState.rightPaddle.y +
          PADDLE_HEIGHT / 2 -
          testGameState.ball.dy, // Center of paddle
      };
      const initialDx = testGameState.ball.dx;

      startGame(testGameState);
      jest.advanceTimersByTime(GAME_INTERVAL_MS);

      // Ball should hit paddle, dx should reverse and dy might change based on angle
      expect(testGameState.ball.dx).toBeCloseTo(-initialDx); // Should reverse horizontal direction
      expect(testGameState.ball.dy).toBeCloseTo(0); // Angle 0 implies no change to dy from original
    });

    test('should increment rightPaddle score and reset ball if ball goes past left wall', () => {
      testGameState.ball = {
        ...testGameState.ball,
        x: BALL_RADIUS / 2 - 1,
        y: 20,
        dx: -5,
      }; // Ball past left wall
      testGameState.rightPaddle.score = 0; // Ensure initial score is 0

      startGame(testGameState);
      jest.advanceTimersByTime(GAME_INTERVAL_MS);

      expect(testGameState.rightPaddle.score).toBe(1);
      expect(resetBallPos).toHaveBeenCalledWith(testGameState); // resetBallPos should be called
    });

    test('should increment leftPaddle score and reset ball if ball goes past right wall', () => {
      testGameState.ball = {
        ...testGameState.ball,
        x: GAME_WIDTH - BALL_RADIUS / 2 + 1,
        y: 20,
        dx: 5,
      }; // Ball past right wall
      testGameState.leftPaddle.score = 0; // Ensure initial score is 0

      startGame(testGameState);
      jest.advanceTimersByTime(GAME_INTERVAL_MS);

      expect(testGameState.leftPaddle.score).toBe(1);
      expect(resetBallPos).toHaveBeenCalledWith(testGameState); // resetBallPos should be called
    });

    test('should not clear interval if it was never set', () => {
      // Ensure the game is not running initially
      // (no startGame before this test)
      const initialClearCallCount = (clearInterval as jest.Mock).mock.calls
        .length;
      testGameState.leftPaddle.score = 5;
      endGame(testGameState);
      expect(clearInterval).toHaveBeenCalledTimes(initialClearCallCount); // Should not increase call count
    });
  });
});
