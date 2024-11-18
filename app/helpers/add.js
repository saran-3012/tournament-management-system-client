import Ember from 'ember';

export function add([num1, num2]) {
  return num1 + num2;
}

export default Ember.Helper.helper(add);
