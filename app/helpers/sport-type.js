import Ember from 'ember';

export function sportType([sportType]) {
  return sportType? 'Individual' : 'Team';
}

export default Ember.Helper.helper(sportType);
