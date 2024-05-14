import dayjs from "dayjs";

/**
 *
 * @param interval ISO time interval with date part only (no time, no time zone) interpreted as closed range (both start and and included)
 * @param date  ISO date time
 * @returns true if the provided date is in the time interval
 */
export const isInClosedRange = (interval: string, date: string): boolean => {
  const [start, end] = parseInterval(interval);
  if (!isValidInterval([start, end])) {
    return false;
  }

  const target = dayjs(date);
  return start.isSameOrBefore(target) && target.isSameOrBefore(end);
};

export const isValidDate = (val: string) => dayjs(val).isValid();

export const dateFormat = (val: Date) => dayjs(val).format("MM/DD/YYYY");

export const dateParse = (val: string) => dayjs(val).toDate();

// i.e.'1970-01-01/1970-01-01'
export const toISODateInterval = (from?: Date, to?: Date) => {
  const [start, end] = [dayjs(from), dayjs(to)];
  if (!isValidInterval([start, end])) {
    return undefined;
  }
  return `${start.format("YYYY-MM-DD")}/${end.format("YYYY-MM-DD")}`;
};

export const parseInterval = (interval: string): dayjs.Dayjs[] =>
  interval?.split("/").map(dayjs) ?? [];

export const isValidInterval = ([from, to]: dayjs.Dayjs[]) =>
  from?.isValid() && to?.isValid() && from?.isSameOrBefore(to);

export const abbreviateInterval = (interval: string) => {
  const [start, end] = parseInterval(interval);
  if (!isValidInterval([start, end])) {
    return undefined;
  }
  return `${start.format("MM-DD")}/${end.format("MM-DD")}`;
};
