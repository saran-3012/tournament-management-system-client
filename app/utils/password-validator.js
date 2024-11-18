export default function passwordValidator(password) {
  if (!password) {
    return false;
  }
  let lwrCse = 0;
  let uprCse = 0;
  let digits = 0;
  let splchs = 0;
  if (password.length < 8) {
    return "Password must be atleast 8 character long";
  }
  for (let ch of password) {
    if (ch >= 'a' && ch <= 'z') {
      lwrCse++;
    }
    else if (ch >= 'A' && ch <= 'Z') {
      uprCse++;
    }
    else if (ch >= '0' && ch <= '9') {
      digits++;
    }
    else {
      splchs++;
    }
  }
  if (!lwrCse) {
    return "Password must contain atleast one lower case character"
  }
  if (!uprCse) {
    return "Password must contain atleast one upper case character"
  }
  if (!digits) {
    return "Password must contain atleast one digit"
  }
  if (!splchs) {
    return "Password must contain atleast one special character"
  }
  return '';
}


