import Ember from 'ember';

export function testLogger([value]) {
  console.log("Logger", value);
  return 'Logger';
}

export default Ember.Helper.helper(testLogger);
