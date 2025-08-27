import { getCurrDate, getDiffInMin } from "../../utils/dates";

describe('getCurrDate', () => {
  beforeAll(() => {
    // Set a fixed system time: August 27, 2025 14:35:42 UTC
    jest.useFakeTimers().setSystemTime(new Date('2025-08-27T14:35:42Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should return the current date in "YYYY-MM-DD HH:mm:ss" format', () => {
    const result = getCurrDate();

    // Adjust based on timezone (if needed). This assumes local time = UTC.
    expect(result).toBe('2025-08-27 14:35:42');
  });
});

describe('getDiffInMin', () => {
  beforeAll(() => {
    // Set the current time to August 27, 2025 15:00:00 UTC
    jest.useFakeTimers().setSystemTime(new Date('2025-08-27T15:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should return the correct difference in minutes (past timestamp)', () => {
    const startTime = new Date('2025-08-27T14:45:00Z').getTime(); // 15 minutes ago
    const diff = getDiffInMin(startTime);
    expect(diff).toBe(15);
  });

  it('should return 0 when the start time is the same as now', () => {
    const startTime = new Date('2025-08-27T15:00:00Z').getTime(); // same time
    const diff = getDiffInMin(startTime);
    expect(diff).toBe(0);
  });

  it('should return a negative value when the start time is in the future', () => {
    const startTime = new Date('2025-08-27T15:15:00Z').getTime(); // 15 minutes in the future
    const diff = getDiffInMin(startTime);
    expect(diff).toBe(-15);
  });
});
