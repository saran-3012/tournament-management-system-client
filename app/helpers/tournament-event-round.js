import Ember from 'ember';

export function tournamentEventRound([value]) {
  switch(+value){
    case 0: return 'Qualifiers';
    case 1: return 'Play-Off';
    case 2: return 'Quarter-Finals';
    case 3: return 'Semi-Finals';
    case 4: return 'Finals';
    default: return 'Match';
  }
}

export default Ember.Helper.helper(tournamentEventRound);
