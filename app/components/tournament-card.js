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

    toggleMenu(event, thisRef){
        const clickEventListener = (event) => {
            if(thisRef.get('isMenuOpen')){
                document.removeEventListener('click', clickEventListener);
                thisRef.set('isMenuOpen', false);
            }
            else{
                setTimeout(() => { 
                    document.addEventListener('click', clickEventListener)
                }, 0);
                thisRef.set('isMenuOpen', true);
            }
        };
        clickEventListener(event);
    },
    init(){
        this._super(...arguments);
        const tournament = this.get('tournament') || {};
        const tournamentPoster = tournamentImageFallback(tournament.sportName);
        Ember.set(tournament, 'tournamentPoster', tournamentPoster);
        this.set('tournament', tournament);
    },
    actions: {
        handleMenuVisibility(event){
            this.get('toggleMenu')(event, this)
        },
        selectAndOpenPopup(){
            this.get('setSelectedTournament')(this.get('tournament'));
            this.get('openCancelPopup')();
        }
    }
});
