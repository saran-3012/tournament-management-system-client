import tournamentPosters from './tournament-posters';
export default function tournamentImageFallback(sportName) {
  if(!sportName){
    return 'images/tournament-place-holder.svg';
  }
  const sportNameKey = sportName.split(' ').join('').toLowerCase();
  return tournamentPosters[sportNameKey] || 'images/tournament-place-holder.svg';
}
