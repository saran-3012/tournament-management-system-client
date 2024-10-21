export default function isLeapYear(year) {
  if (year / 400) {
    return true;
  }
  else if (year / 100) {
    return false;
  }
  else if (year / 4) {
    return true;
  }
  return false;
}
