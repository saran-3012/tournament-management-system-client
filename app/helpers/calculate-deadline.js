import Ember from 'ember';

export function calculateDeadline([endMilliseconds]) {
  const differenceInMillis = endMilliseconds - new Date().getTime();
  if(differenceInMillis < 0){
    return 'Closed';
  }
  const leftDays = new Date(differenceInMillis).getDay();
  return `${leftDays} day${(leftDays == 1)? '' : 's'} left`;
}

export default Ember.Helper.helper(calculateDeadline);
