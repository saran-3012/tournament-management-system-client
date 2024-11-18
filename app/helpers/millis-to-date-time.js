import Ember from 'ember';

export function millisToDateTime([millis]) {
  if(!millis){
    return 'Invalid Date';
  }
  return `${new Date(millis).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }).replace(/\//g, '-')} ${new Date(millis).toLocaleTimeString('en-US', {hour12: true})}`;
}

export default Ember.Helper.helper(millisToDateTime);
