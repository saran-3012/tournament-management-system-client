import Ember from 'ember';
import tournamentImageFallback from '../../utils/tournament-image-fallback';
import millisToDate from '../../utils/millis-to-date';


export default Ember.Route.extend({
    envService:  Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    loaderService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function() {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo || {};
    }),
    beforeModel(transition){
        this.get('loaderService').setIsLoading(true);

        if(!this.get('authenticationService').isLoggedIn){
            this.transitionTo('login');
            return;
        }

        const userInfo = this.get('userInfo');
        if(userInfo.role === null || userInfo.role === undefined || userInfo.organizationId === null || userInfo.organizationId === undefined){
            this.get('authenticationService').logout();
            this.transitionTo('login');
            return;
        }

    },
    model(params){
        const userInfo = this.get('userInfo');
        const orgId = +userInfo.organizationId;
        const tournamentId = +params.tournament_id;
        const config = this.get('envService');
        const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${orgId}/tournaments/${tournamentId}/contestants?include_count=true&include_tournament=true`;
        
        return $.ajax({
            method: 'GET',
            url: apiURL,
            accepts: {
                'json' : 'application/json' 
            },
            dataType: 'json'
        })
        .then((data, textStatus, jqXHR) => {
            if(jqXHR.status === 401 || jqXHR.status === 403){
                this.transitionTo('access-denied');
            }
            return data.data;
        })
        .catch((err) => {
            if(err.status === 401 || err.status === 403){
                this.transitionTo('access-denied');
            }
            console.log(err);
        })
        .always(() => {
            this.get('loaderService').setIsLoading(false);
        });

      
    },
    afterModel(model){
        console.log(model);
    },
    setupController(controller, model){
        const tournament = model.tournament;
        tournament['registeredCount'] = model.count;
        tournament.tournamentPoster = tournamentImageFallback(tournament.sportName);
        tournament.tournamentVenue = tournament.tournamentVenue || 'Not Specified';
        tournament.tournamentDate = millisToDate(tournament.tournamentDate);
        controller.set('tournament', tournament);
        controller.set((!model.tournament.sportType)? 'participants' : 'teams', model.contestants);
    }
});
