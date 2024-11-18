import Ember from 'ember';
import tournamentImageFallback from '../../utils/tournament-image-fallback';
import controllerCleanup from '../../mixins/controller-cleanup';


export default Ember.Route.extend(controllerCleanup, {
    messageQueueService: Ember.inject.service(),
    envService:  Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    loaderService: Ember.inject.service(),
    dataPersistanceService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function() {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo || {};
    }),
    beforeModel(){
        
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
        
        this.get('loaderService').setIsLoading(true);
    },
    model(params){
        const messageQueueService = this.get('messageQueueService');

        const userInfo = this.get('userInfo');
        const orgId = +userInfo.organizationId;
        const tournamentId = +params.tournament_id;
        const config = this.get('envService');
        
        const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${orgId}/tournaments/${tournamentId}/contestants?include_count=true&include_tournament=true&include_user=true`;
        
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
            const authStatus = err.getResponseHeader('Tms-Auth-Status');
            if(authStatus === '1'){
                messageQueueService.addPopupMessage({
                    message: "Session expired, login again",
                    level: 0
                });
                this.get('authenticationService').logout();
                this.transitionToRoute('index');
                return;
            }
            if(err.status === 401 || err.status === 403){
                messageQueueService.addPopupMessage({
                    message: "Not allowed to perform this operation",
                    level: 3
                });
                this.transitionTo('access-denied');
                return;
            }


            console.log(err);
        })
        .always(() => {
            this.get('loaderService').setIsLoading(false);
        });
    },
    setupController(controller, model){
        if(!model) return;
        const tournament = model.tournament;
        tournament['registeredCount'] = '' + model.count;
        tournament.tournamentPoster = tournamentImageFallback(tournament.sportName);
        controller.set('tournament', tournament);
        const participationType = (+tournament.sportType === 0)? 'participants' : 'teams';
        controller.set(participationType , model[participationType]);
        const userParticipation = model.userParticipation;
        if((userParticipation.teamId !== undefined && userParticipation.teamId !== null) || (userParticipation.participantId !== undefined && userParticipation.participantId !== null)){
            userParticipation.userRegistered = true;
        }
        controller.set("userParticipation", userParticipation);
        this.get('dataPersistanceService').setData(`tournament:${tournament.tournamentId}`,tournament);
    },
    actions: {
        willTransition(transition){
            this.controllerCleanup();
        },
    }
});
