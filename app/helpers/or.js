import Ember from 'ember';

export function or(params) {
  if(!params || params.length === 0){
    return false;
  }
  for(const logic of params){
    if(logic){
      return logic;
    }
  }
  return params[params.length - 1];
}

export default Ember.Helper.helper(or);
