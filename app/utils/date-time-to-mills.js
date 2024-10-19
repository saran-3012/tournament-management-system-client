export default function dateTimeToMills(dateTime) {
  const dateArr = dateTime.split(/[-\/:]/);
  let formattedDate = `${dateArr[1]}-${dateArr[0]}-${dateArr[2]}`;
  if(dateArr.length > 3){
    formattedDate += ` ${dateArr[3]}:`;
  }
  if(dateArr.length > 4){
    formattedDate += `${dateArr[4]}:`
  }
  if(dateArr.length > 5){
    formattedDate += `${dateArr[5]}`;
  }
  return new Date(formattedDate).getTime();
}
