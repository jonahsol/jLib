import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

import { toDayjs, DateArg } from "./index";

/**
 * Event times are always relative to `eventUtcOffset` but if a user is using
 * the app in a different timezone (eg. during daylight saving time) then their
 * local machine will display times relative to that timezone. We define
 * functions so that the user is shown event times relative to `eventUtcOffset`.
 */

export const eventUtcOffset = parseInt(process.env.EVENT_UTC_OFFSET);

// Add a `eventUtcOffset` timestamp to `d` so that `d`'s manipulation methods
// (eg. format, startOfDay) are performed relative to `eventUtcOffset`.
// WARNING: If `d` has a +11 timestamp (and eventUtcOffset == +10), then:
//            - toDateWithOffset(d).isSame(d) === true
//            - toDateWithOffset(d).startOf('day').isSame(d).startOf('day') === false
//          This is because the start of a day is a different time in different
//          timezones. The upshot of this is that it's important to be careful
//          when doing date comparisons if the dates potentially have different
//          timestamps.
export function withEventOffset(d: DateArg, x = false): Dayjs {
  return toDayjs(d).utc().utcOffset(eventUtcOffset, x);
}

export function startOfDayInEventOffset(d: DateArg): Dayjs {
  return withEventOffset(d).startOf("day");
}

function getTzDiffMinutes(d: Date): number {
  return eventUtcOffset - -d.getTimezoneOffset();
}
export const shift = (
  by: (sinceEpochMs: number, tzDiffMs: number) => number
) => (d: Date | Dayjs): Date => {
  const da: Date = dayjs.isDayjs(d) ? d.toDate() : d;
  // https://stackoverflow.com/a/11964609
  return new Date(by(da.valueOf(), getTzDiffMinutes(da) * 60 * 1000));
};
export const subtractTzDiff = shift((time, tzDiff) => time - tzDiff);
export const addTzDiff = shift((time, tzDiff) => time + tzDiff);
export const shiftForward = shift((t, _) => t + eventUtcOffset * 60 * 1000);
export const shiftBackward = shift((t, _) => t - eventUtcOffset * 60 * 1000);

export const convertToEvTz = (d: Date | Dayjs) =>
  withEventOffset(subtractTzDiff(d));
export const convertToEvTzDay = (d: Date | Dayjs) => {
  const x = withEventOffset(d);
  if (x.hour() === 0) return x;
  else return withEventOffset(subtractTzDiff(x));
};
