import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import weekday from "dayjs/plugin/weekday";
dayjs.extend(customParseFormat);
dayjs.extend(weekday);
import intersectionWith from "lodash/intersectionWith";
import differenceWith from "lodash/differenceWith";
import unionWith from "lodash/unionWith";
import groupBy from "lodash/groupBy";
import keyBy from "lodash/keyBy";
import { lowercaseFirst } from "../string";
import { toObject } from "../functions";

export const dateStringToDayjs = (
  dateStr: string | undefined
): Dayjs | undefined => {
  // check if defined since dayjs(undefined) == dayjs()
  return dateStr ? dayjs(dateStr) : undefined;
};

export const dayjsToDateString = (dayjs: Dayjs | null) => {
  return dayjs?.toISOString();
};

export type DateDisplayFormat =
  | "Date"
  | "DateWithYear"
  | "LongDateWithYear"
  | "DayWithDate"
  | "DayWithLongDate"
  | "BracketedDayWithDate"
  | "ShortDayWithDate";

const todayStr = "Today";

export type DateArg = Date | Dayjs | string | undefined | null;
export function toDayjs(da: DateArg) {
  if (dayjs.isDayjs(da)) return da;
  else if (typeof da === "string") return dateStringToDayjs(da);
  else if (da instanceof Date) return dayjs(da);
  else return undefined;
}
export type DisplayDateSettings = Parameters<typeof displayDate>[1];

export function displayDate(
  date: DateArg,
  settings?: { format?: DateDisplayFormat; seperator?: "-" | "/" }
) {
  if (!date) return "date(?)";
  const sep = settings?.seperator ? settings.seperator : "/";

  if (settings && settings.format) {
    switch (settings.format) {
      case "Date":
        return dayjs(date).format(`DD${sep}MM`);
      case "DateWithYear":
        return dayjs(date).format(`DD${sep}MM${sep}YY`);
      case "LongDateWithYear":
        return dayjs(date).format("Do MMM, YY");

      // SOMEDAY Dayjs `dddd` (eg. Thursday) gives one day later than `ddd`.
      // Perhaps a timezone issue? Not sure
      //
      //   case "DayWithLongDate":
      //     const d1 = dayjs(date);
      //     const dateStr1 = d1.format("Do MMM, YY");

      //     const dayStr = getDayStr(d1);

      //     if (dayStr === todayStr) return `${getDayStr(d1)} - ${dateStr1}`;
      //     else return `${getDayStr(d1)} ${dateStr1}`;

      case "DayWithDate":
        const d = dayjs(date);
        const dateStr = d.format(`DD${sep}MM${sep}YY`);

        return `${getDayStr(d)}, ${dateStr}`;
      case "ShortDayWithDate":
        const d3 = dayjs(date);
        const dateStr3 = d3.format(`DD${sep}MM${sep}YY`);

        return `${getDayStr(d3, false, "ddd")} ${dateStr3}`;
      case "BracketedDayWithDate":
        const d2 = dayjs(date);
        const dateStr2 = d2.format(`DD${sep}MM${sep}YY`);

        return `${dateStr2} (${getDayStr(d2, true)})`;
    }
  } else
    return displayDate(date, {
      ...toObject(settings),
      format: "ShortDayWithDate",
    });

  function getDayStr(
    d: Dayjs,
    lowerToday?: boolean,
    format?: Parameters<Dayjs["format"]>[0]
  ) {
    let dayStr;
    if (isToday(d)) dayStr = lowerToday ? lowercaseFirst(todayStr) : todayStr;
    else dayStr = d.format(format || "ddd");

    return dayStr;
  }
}

export function displayDateRangeF(
  start?: DateArg,
  end?: DateArg,
  format?: { start: (d: DateArg) => string; end: (d: DateArg) => string }
) {
  let startStr = "?";
  let endStr = "?";

  if (start !== undefined) startStr = format.start(start);
  if (end !== undefined) endStr = format.end(end);

  return startStr + " - " + endStr;
}

export function displayDateRange(
  start?: DateArg,
  finish?: DateArg,
  format?: { start: string; end: string }
) {
  let startStr = "?";
  let finishStr = "?";

  const startDayjs = dayjs(start);
  const finishDayjs = dayjs(finish);

  // If both am/pm, only show am/pm on the finish time
  const showAmOrPmOnStartTime =
    startDayjs.format("a") !== finishDayjs.format("a");

  if (start !== undefined) {
    startStr = dayjs(start).format(
      format ? format.start : `h:mm${showAmOrPmOnStartTime ? "a" : ""}`
    );
  }
  if (finish !== undefined) {
    finishStr = dayjs(finish).format(format ? format.end : "h:mma");
  }

  return startStr + " - " + finishStr;
}

export const startOfToday = dayjs().startOf("day");

export const isAfterToday = (m: Dayjs) => !m || m.startOf("day") > startOfToday;
export const isBeforeToday = (m: Dayjs) => m.startOf("day") < startOfToday;

function getDateFormatStrings() {
  const dateFormatStrings = [];
  const formats = {
    day: ["D", "DD"],
    month: ["M", "MM"],
    year: ["YY", "YYYY"],
  };

  for (let dFormat of formats.day) {
    for (let mFormat of formats.month) {
      for (let yFormat of formats.year) {
        dateFormatStrings.push(`${dFormat}-${mFormat}-${yFormat}`);
        dateFormatStrings.push(`${dFormat}/${mFormat}/${yFormat}`);
      }
    }
  }

  return dateFormatStrings;
}
export const dateFormatStrings = getDateFormatStrings();

// TODO: rename to "deserialiseFormattedDate"
export function deserialiseDate(dateStr: string): Dayjs {
  return dayjs(dateStr, dateFormatStrings);
}
export const serialiseDateFormat = "DD-MM-YY";
export function serialiseDate(d: Dayjs) {
  return d.format(serialiseDateFormat);
}
export function groupByDate<T>(xs: T[], getDate: (t: T) => DateArg) {
  return groupBy<T>(xs, (x) => serialiseDate(toDayjs(getDate(x))));
}
export function keyByDate<T>(xs: T[], getDate: (t: T) => DateArg) {
  return keyBy<T>(xs, (x) => serialiseDate(toDayjs(getDate(x))));
}

export const todayDayjs = dayjs().startOf("day");
export function isToday(m: Dayjs) {
  return m.startOf("day").diff(todayDayjs) === 0;
}

export function datetimeEqual(d1: string | Dayjs, d2: string | Dayjs) {
  const d1d = typeof d1 === "string" ? dayjs(d1) : d1;
  const d2d = typeof d2 === "string" ? dayjs(d2) : d2;

  return d1d.diff(d2d);
}
export function timeEqual(d1: string | Dayjs, d2: string | Dayjs) {
  const d1d = typeof d1 === "string" ? dayjs(d1) : d1;
  const d2d = typeof d2 === "string" ? dayjs(d2) : d2;

  return (
    d1d.hour() === d2d.hour() &&
    d1d.minute() === d2d.minute() &&
    d1d.second() === d2d.second()
  );
}

export function dayEqual(d1: string | Dayjs, d2: string | Dayjs) {
  const d1d = typeof d1 === "string" ? dateStringToDayjs(d1) : d1;
  const d2d = typeof d2 === "string" ? dateStringToDayjs(d2) : d2;

  return d1d.startOf("day").isSame(d2d.startOf("day"));
}
export function isBetweenDates(
  date: string | Dayjs,
  start: string | Dayjs,
  end: string | Dayjs
) {
  const cDate = typeof date === "string" ? dateStringToDayjs(date) : date;
  const dStart = typeof start === "string" ? dateStringToDayjs(start) : start;
  const dEnd = typeof end === "string" ? dateStringToDayjs(end) : end;

  return (
    (dayEqual(date, start) || dStart.isBefore(date)) &&
    (dayEqual(date, end) || dEnd.isAfter(date))
  );
}

export function addTimeOfDay(date: Dayjs, timeOfDay: Dayjs) {
  return date
    .add(timeOfDay.hour(), "hour")
    .add(timeOfDay.minute(), "minute")
    .add(timeOfDay.second(), "second");
}

export function throwIfNotAfter(d1: Dayjs, d2: Dayjs) {
  if (d1.isAfter(d2))
    throw new Error(`start ${d1.format()} cannot be after end ${d2.format()}`);
}

export const compareDates = (d1: Dayjs, d2: Dayjs) => d1.diff(d2);
export const diffByTimeOfDay = (d1: Dayjs, d2: Dayjs) =>
  addTimeOfDay(todayDayjs, d1).diff(addTimeOfDay(todayDayjs, d2));
export const diffByDate = (d1: Dayjs, d2: Dayjs) =>
  d1.startOf("day").diff(d2.startOf("day"));

// Intersection of two sets of dates.
export const intersectDates = (xs: Dayjs[], ys: Dayjs[]) =>
  intersectionWith(xs, ys, (x, y) => !compareDates(x, y));

// Intersection of two sets of dates, where two dates are equal if they have the
// same date (not same datetime).
export const intersectDatesByDate = (xs: Dayjs[], ys: Dayjs[]): Dayjs[] =>
  intersectionWith<Dayjs, Dayjs>(xs, ys, dayEqual);

// Intersection of two sets of dates, where two dates are equal if they have the
// same date (not same datetime).
export const unionDatesByDate = (xs: Dayjs[], ys: Dayjs[]): Dayjs[] =>
  unionWith<Dayjs>(xs, ys, dayEqual);

// Difference of two sets of dates.
export const diffDates = (xs: Dayjs[], ys: Dayjs[]): Dayjs[] =>
  differenceWith(xs, ys, (x, y) => !compareDates(x, y));

export function mondayOfWeek(d: Dayjs) {
  return d.weekday(0);
}
export function sundayOfWeek(d: Dayjs) {
  return d.weekday(7);
}
