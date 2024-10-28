import Ember from 'ember';

export function object(entries) {
  const obj = {};
  const n = entries.length;
  for(let i=0; i<n; i+=2){
    obj[entries[i]] = entries[i+1];
  }
  return obj;
}

export default Ember.Helper.helper(object);
