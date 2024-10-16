import Ember from 'ember';

export function millisToDate([millis]) {
  if(!millis){
    return 'Invalid Date';
  }
  return new Date(millis).toLocaleDateString();
}

export default Ember.Helper.helper(millisToDate);
