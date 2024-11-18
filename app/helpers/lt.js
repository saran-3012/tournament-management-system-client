import Ember from 'ember';

export function lt([value1, value2]) {
  return value1 < value2;
}

export default Ember.Helper.helper(lt);
