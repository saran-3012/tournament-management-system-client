import Ember from 'ember';

export function calculateDeadline([startMilliseconds, endMilliseconds]) {
  const currentTime = new Date().getTime();
  if(currentTime < startMilliseconds){
    return 'Not Started';
  }
  const differenceInMillis = endMilliseconds - currentTime;
  if(differenceInMillis <= 0){
    return 'Closed';
  }
  const leftDays = new Date(differenceInMillis).getDay();
  return `${leftDays} day${(leftDays == 1)? '' : 's'} left`;
}

export default Ember.Helper.helper(calculateDeadline);
