import Ember from 'ember';

export function isEmpty([array]) {
  return !array || array.length === 0;
}

export default Ember.Helper.helper(isEmpty);
