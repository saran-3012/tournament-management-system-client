import Ember from 'ember';

export function truncateName([value]) {
  if(!value){
    return value;
  }
  return value.split(' ')[0];
}

export default Ember.Helper.helper(truncateName);
