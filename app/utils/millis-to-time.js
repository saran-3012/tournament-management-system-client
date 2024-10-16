export default function millisToTime(millis) {
  if(!millis){
    return "Not Specified";
  }
  return new Date(millis).toLocaleTimeString('en-US', {hour12: true});
}
