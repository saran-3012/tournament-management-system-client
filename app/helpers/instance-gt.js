import Ember from 'ember';

export function instanceGt([millis]) {
  return millis < Date.now();
}

export default Ember.Helper.helper(instanceGt);
