import Ember from 'ember';

export function instanceLt([millis]) {
  return millis > Date.now();
}

export default Ember.Helper.helper(instanceLt);
