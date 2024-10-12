import Ember from 'ember';

export function getDate([millis]) {
  if(!millis){
    return 'Not specified';
  }
  return new Date(millis).toLocaleDateString();
}

export default Ember.Helper.helper(getDate);
