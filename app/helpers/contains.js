import Ember from 'ember';

export function contains([searchArray, searchValue, searchKey]/*, hash*/) {
  if(!searchArray){
    return false;
  }
  if(!searchKey){
    return searchArray.includes(searchValue);
  }
  for(const element of searchArray){
    if(element[searchKey] === searchValue[searchKey]){
      return true;
    }
  }
  return false;
}

export default Ember.Helper.helper(contains);
