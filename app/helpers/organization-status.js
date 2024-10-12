import Ember from 'ember';

export function organizationStatus([orgStatus]) {
  switch(orgStatus){
    case 0:
      return 'Not Verified';
    case 1:
      return 'Verified';
    case 2:
      return 'Banned';
    default:
      return 'Closed';
  }
}

export default Ember.Helper.helper(organizationStatus);
