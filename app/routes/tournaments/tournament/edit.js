import Ember from 'ember';
import controllerCleanup from '../../../mixins/controller-cleanup';

export default Ember.Route.extend(controllerCleanup, {
    dataPersistanceService: Ember.inject.service(),
    envService:  Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    loaderService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function() {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo || {};
    }),
    beforeModel(){
        const authenticationService = this.get('authenticationService');
        if(!authenticationService.isLoggedIn){
            this.transitionTo('login');
            return;
        } 
        if(+authenticationService.userInfo.role !== 1 && +authenticationService.userInfo.role !== 2){
            this.transitionTo('dashboard');
            return;
        } 
    },
    model(params){
        const parentModel = this.modelFor('tournaments.tournament');

        const tournament = parentModel.tournament;
        const tournamentId = +tournament.tournamentId;

        if(tournament !== null){
            return tournament;
        }
        
        const messageQueueService = this.get('messageQueueService');

        const userInfo = this.get('userInfo');
        const orgId = +userInfo.organizationId;
        const config = this.get('envService');
        
        const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${orgId}/tournaments/${tournamentId}`;
        
        return $.ajax({
            method: 'GET',
            url: apiURL,
            accepts: {
                'json' : 'application/json' 
            },
            dataType: 'json'
        })
        .then((response, textStatus, jqXHR) => {
            if(jqXHR.status === 401 || jqXHR.status === 403){
                this.transitionTo('access-denied');
            }
            
            return response.data;
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
        })
        .always(() => {
            this.get('loaderService').setIsLoading(false);
        });
    },
    setupController(controller, model){
        controller.set('tournament', model);
    },
    actions: {
        willTransition(transition){
            this.controllerCleanup();
        }
    }
});
