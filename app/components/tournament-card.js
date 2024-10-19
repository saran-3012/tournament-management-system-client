import Ember from 'ember';
import tournamentImageFallback from '../utils/tournament-image-fallback';

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['tournament-card'],
    authenticationService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function(){
        return this.get('authenticationService').userInfo;
    }),
    isMenuOpen: false,
    init(){
        this._super(...arguments);
        const tournament = this.get('tournament') || {};
        const tournamentPoster = tournamentImageFallback(tournament.sportName);
        tournament['tournamentPoster'] = tournamentPoster;
        this.set('tournament', tournament);
    },
    actions: {
        // setIsMenuOpen(value){
        //     const userInfo = this.get('authenticationService').userInfo;
        //     if(userInfo.role !== 1 && userInfo.role !== 2){
        //         return;
        //     }
        //     this.set('isMenuOpen', value);
        // },
        handleMenuVisibility(event){

        }
    }
});
