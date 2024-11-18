export default function millisToDate(millis) {
  if(!millis){
    return "Not Specified";
  }
  return new Date(millis).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');;
}
