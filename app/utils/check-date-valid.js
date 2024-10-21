import getMonthDaysCount from "./get-month-days-count";

export default function checkDateValid(date) {
  const [day, month, year] = date.split("/").map(Number);
  if (!year) {
    return false;
  }
  if (!month || month < 1 || month > 12) {
    return false;
  }
  if (!day || day < 1 || day > getMonthDaysCount(month, year)) {
    return false;
  }
  return true;
};
