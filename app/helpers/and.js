import Ember from 'ember';

export function and(params) {
  for(const logic of params){
    if(!logic){
      return logic;
    }
  }
  return true;
}

export default Ember.Helper.helper(and);
