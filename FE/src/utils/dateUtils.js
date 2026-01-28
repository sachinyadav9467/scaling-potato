import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, isSameDay, differenceInDays } from 'date-fns';

export const formatDate = (date, formatStr = 'yyyy-MM-dd') => {
  return format(new Date(date), formatStr);
};

export const getDateString = (date) => {
  return formatDate(date, 'yyyy-MM-dd');
};

export const getWeekDates = (date) => {
  const start = startOfWeek(new Date(date), { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(new Date(date), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const getMonthDates = (date) => {
  const start = startOfMonth(new Date(date));
  const end = endOfMonth(new Date(date));
  return eachDayOfInterval({ start, end });
};

export const getDaysUntilDue = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diff = differenceInDays(due, today);
  return diff;
};

export const isOverdue = (dueDate) => {
  return getDaysUntilDue(dueDate) < 0;
};

export const getPreviousDay = (date) => {
  return subDays(new Date(date), 1);
};

export const getNextDay = (date) => {
  return addDays(new Date(date), 1);
};

export const isSameDate = (date1, date2) => {
  return isSameDay(new Date(date1), new Date(date2));
};

export const addWeeksToDate = (date, weeks) => {
  return addWeeks(new Date(date), weeks);
};

export const subWeeksFromDate = (date, weeks) => {
  return subWeeks(new Date(date), weeks);
};

export const addMonthsToDate = (date, months) => {
  return addMonths(new Date(date), months);
};

export const subMonthsFromDate = (date, months) => {
  return subMonths(new Date(date), months);
};

export { startOfMonth, endOfMonth };
