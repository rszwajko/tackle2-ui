import dayjs from "dayjs";

export const isValidDate = (val: string) => dayjs(val).isValid();

export const dateFormat = (val: Date) => dayjs(val).format("MM/DD/YYYY");

export const dateParse = (val: string) => dayjs(val).toDate();

// i.e.'1970-01-01/1970-01-01'
export const toISODateInterval = (from?: Date, to?: Date) => {
  const [start, end] = [dayjs(from), dayjs(to)];
  if (!isValidInterval([start, end])) {
    return undefined;
  }
  return `${start.format("YYYY-MM-dd")}/${end.format("YYYY-MM-dd")}`;
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
  return `${start.format("MM-dd")}/${end.format("MM-dd")}`;
};
