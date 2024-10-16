export default function millisToDate(millis) {
  if(!millis){
    return "Not Specified";
  }
  return new Date(millis).toLocaleDateString();
}
