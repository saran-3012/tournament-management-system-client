import Ember from 'ember';
import tournamentImageFallback from '../utils/tournament-image-fallback';

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['tournament-card'],
    init(){
        this._super(...arguments);
        const tournament = this.get('tournament') || {};
        const tournamentPoster = tournamentImageFallback(tournament.sportName);
        tournament['tournamentPoster'] = tournamentPoster;
        this.set('tournament', tournament);
    }
});
