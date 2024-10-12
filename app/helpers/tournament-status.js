import Ember from 'ember';

export function tournamentStatus([tournamentStatus]) {
  switch(tournamentStatus){
    case 0:
      return 'Upcoming';
    case 1:
      return 'Ongoing';
    case 2:
      return 'Completed';
    case 3:
      return 'Cancelled';
    default:
      return 'Closed';
  }
}

export default Ember.Helper.helper(tournamentStatus);
