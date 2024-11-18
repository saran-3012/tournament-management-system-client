import Ember from 'ember';

export default Ember.Component.extend({
    // Component details
    tagName: 'div',
    classNames: ['tournament-schedule-card'],
    attributeBindings: ['title'],
    init(){
        this._super(...arguments);

        const dataPersistanceService = this.get('dataPersistanceService');
        const schedule = this.get('schedule');
        const tournamentId = schedule.tournamentId;


        let tournament = dataPersistanceService.getData(`tournament:${tournamentId}`);

        if(tournament !== null){
            this.set('tournament', tournament);
            return;
        }

        const messageQueueService = this.get('messageQueueService');

        const userInfo = this.get('userInfo');
        const orgId = +userInfo.organizationId;
        const config = this.get('envService');
        
        const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${orgId}/tournaments/${tournamentId}`;
        
        $.ajax({
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
            
            tournament = response.data;
            dataPersistanceService.setData(`tournament:${tournamentId}`, tournament);
            this.set('tournament', tournament);

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
    

    // Services
    messageQueueService: Ember.inject.service(),
    envService: Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    loaderService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function () {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo || {};
    }),
    dataPersistanceService: Ember.inject.service(),


    // State config
    isContestantsPanelOpen: false,

    // API calls
    fetchEventContestants(thisRef){

        const userInfo = thisRef.get('userInfo');
        const schedule = thisRef.get('schedule');
        const tournament = thisRef.get('tournament');
        const config = thisRef.get('envService');
        const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${userInfo.organizationId}/tournaments/${schedule.tournamentId}/events/${schedule.tournamentEventId}/contestants?exclude_limit=true`;
        const dataPersistanceService = thisRef.get('dataPersistanceService');
        const participationType = (+tournament.sportType === 0)? 'participants' : 'teams';

        $.ajax({
            method: 'GET',
            url: apiURL,
            dataType: "json",
            contentType: "application/json",
            accepts: {
                json: "application/json"
            }
        })
        .then((response, textStatus, jqXHR) => {
            thisRef.set(participationType, response.data);
            console.log(`tournamenteventschedule:${schedule.tournamentEventId},${participationType}`)
            dataPersistanceService.setData(`tournamenteventschedule:${schedule.tournamentEventId},${participationType}`, response.data);
            console.log(response.data)
        })
        .catch((err) => {
            thisRef.get('messageQueueService').addPopupMessage({
                message: err.responseJSON.message,
                level: 3
            })
        });
    },

    // actions
    actions: {
        openSchedulePopup(schedulePopupType){
            const schedule = this.get('schedule');
            // if(schedulePopupType === 2){
            //     const tournament = this.get('tournament');
            //     const participationType = (+tournament.sportType === 0)? 'participants' : 'teams';
            //     if(!this.get(participationType)){
            //         this.get('fetchEventContestants')(this);
            //     }
            // }
            this.get('setTournamentScheduleFormType')(schedulePopupType);
            this.get('setSelectedSchedule')(schedule);
        },
        toggleContestantsPanelOpen(){
            const tournament = this.get('tournament');
            const participationType = (+tournament.sportType === 0)? 'participants' : 'teams';

            this.toggleProperty('isContestantsPanelOpen');
            const isMembersPanelOpen = this.get('isContestantsPanelOpen');
            if(isMembersPanelOpen && !this.get(participationType)){
                this.get('fetchEventContestants')(this);
            }
        },
        reloadContestants(){
            this.get('fetchEventContestants')(this);
        }
    }
});
