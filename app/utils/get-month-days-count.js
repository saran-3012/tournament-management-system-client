import isLeapYear from "./is-leap-year";

export default function getMonthDaysCount(month, year) {
  switch (month) {
    case 1:
    case 3:
    case 5:
    case 7:
    case 8:
    case 10:
    case 12:
      return 31;
    case 2:
      return 28 + isLeapYear(year);
    default:
      return 30;
  }
}
