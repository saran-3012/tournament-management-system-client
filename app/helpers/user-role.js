import Ember from 'ember';

export function userRole([role]) {
  switch(role){
    case 0:
      return 'Member';
    case 1:
      return 'Organization Admin';
    case 2:
      return 'App Admin';
    default:
      return 'No Role';
  }
}

export default Ember.Helper.helper(userRole);
