import Ember from 'ember';

export function or(params) {
  for(const logic of params){
    if(logic){
      return logic;
    }
  }
  return false;
}

export default Ember.Helper.helper(or);
