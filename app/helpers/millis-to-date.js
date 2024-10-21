import Ember from 'ember';

export function millisToDate([millis, message]) {
  if(!millis){
    return (message !== null && message !== undefined)? message : 'Not specified';
  }
  return new Date(millis).toLocaleDateString();
}

export default Ember.Helper.helper(millisToDate);
