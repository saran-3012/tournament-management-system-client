import Ember from 'ember';

export function millisToDateTime([millis]) {
  if(!millis){
    return 'Invalid Date';
  }
  return `${new Date(millis).toLocaleDateString()} ${new Date(millis).toLocaleTimeString('en-US', {hour12: true})}`;
}

export default Ember.Helper.helper(millisToDateTime);
