import Ember from 'ember';

export function testLogger(values) {
  console.log("Logger", ...values);
  return 'Logger';
}

export default Ember.Helper.helper(testLogger);
