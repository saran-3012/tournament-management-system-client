import Ember from 'ember';

export function millisToDate([millis, message]) {
  if(!millis){
    return (message !== null && message !== undefined)? message : 'Not specified';
  }
  return new Date(millis).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).replace(/\//g, '-');
}

export default Ember.Helper.helper(millisToDate);
