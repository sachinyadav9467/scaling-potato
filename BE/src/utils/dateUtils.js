export const formatDate = (date) => {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return date;
};

export const parseDate = (dateString) => {
  return new Date(dateString + 'T00:00:00.000Z');
};

export const getWeekRange = (date) => {
  const d = new Date(parseDate(date));
  const day = d.getUTCDay();
  // Calculate days to subtract to get to Monday (week starts on Monday)
  // If day is 0 (Sunday), subtract 6 days to get to Monday
  // Otherwise, subtract (day - 1) to get to Monday
  const daysToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(d);
  monday.setUTCDate(monday.getUTCDate() - daysToMonday);
  monday.setUTCHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setUTCDate(sunday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);
  
  return {
    weekStart: formatDate(monday),
    weekEnd: formatDate(sunday)
  };
};

export const getMonthRange = (year, month) => {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  
  return {
    startDate: formatDate(start),
    endDate: formatDate(end)
  };
};

export const isDateInRange = (date, startDate, endDate) => {
  const d = parseDate(date);
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  return d >= start && d <= end;
};

export const getDaysOfWeek = (daysOfWeek) => {
  // Convert from API format (0=Sunday) to JS format (0=Sunday)
  return daysOfWeek || [];
};

export const shouldGenerateAssignment = (assignment, date) => {
  const { type, assignedDate, dueDate, scheduleRule } = assignment;
  const checkDate = parseDate(date);
  const assigned = parseDate(assignedDate);
  const due = parseDate(dueDate);

  // Date must be within range
  if (checkDate < assigned || checkDate > due) {
    return false;
  }

  switch (type) {
    case 'one-time':
      return true;
    
    case 'daily':
      return true;
    
    case 'weekly':
      if (!scheduleRule || !scheduleRule.daysOfWeek) {
        return false;
      }
      const dayOfWeek = checkDate.getUTCDay();
      return scheduleRule.daysOfWeek.includes(dayOfWeek);
    
    case 'monthly':
      const assignedDay = assigned.getUTCDate();
      return checkDate.getUTCDate() === assignedDay;
    
    default:
      return false;
  }
};
