import Ember from 'ember';

export function computeGender([gender]) {
  switch(gender){
    case 0:
      return '-';
    case 1:
      return 'Female';
    case 2:
      return 'Male';
    default:
      return 'Others';
  }
}

export default Ember.Helper.helper(computeGender);
