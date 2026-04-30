function getMonthFromDate(dateString) {
  return String(dateString).slice(0, 7);
}

function getPreviousMonth(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1, 1));
  date.setUTCMonth(date.getUTCMonth() - 1);
  const prevYear = date.getUTCFullYear();
  const prevMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${prevYear}-${prevMonth}`;
}

function isWithinDateRange(dateString, startDate, endDate) {
  if (startDate && dateString < startDate) {
    return false;
  }

  if (endDate && dateString > endDate) {
    return false;
  }

  return true;
}

module.exports = {
  getMonthFromDate,
  getPreviousMonth,
  isWithinDateRange
};
