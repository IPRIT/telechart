const hour = 3600 * 1000;

/**
 * @type {{second: number, minute: number, hour: number, day: number, week: number, month: number, year: number}}
 */
export const TimeRanges = {
  second: 1000,
  minute: hour / 60,
  hour,
  day: hour * 24,
  week: hour * 24 * 7,
  month: hour * 24 * 30, // rude
  year: hour * 24 * 365
};
