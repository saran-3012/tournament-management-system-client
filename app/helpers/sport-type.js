import Ember from 'ember';

export function sportType([sportType, teamSize]) {
  if(sportType === 0){
    return 'Individual';
  }
  if(!teamSize){
    return 'Team';
  }
  return `Team - ${teamSize} members`;
}

export default Ember.Helper.helper(sportType);
