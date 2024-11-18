import Ember from 'ember';
import $ from 'jquery';

export default Ember.Controller.extend({
    // Sercices
    envService:  Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    loaderService: Ember.inject.service(),
    messageQueueService: Ember.inject.service(),

    // User info
    userInfo: Ember.computed('authenticationService.userInfo', function() {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo || {};
    }),

    // State config
    contestantsPage: 0,
    schedulesPage: 0,
    limitPerPage: 20,
    tournamentFormType: 0,
    tournamentScheduleFormType: 0,
    eventPageType: 0,

    // API Calls
    fetchRegisteredContestants(includeLimit=true){
        const messageQueueService = this.get('messageQueueService');

        const tournament = this.get('tournament');
        const userInfo = this.get('userInfo');
        const orgId = userInfo.organizationId;
        const config = this.get('envService');
        const participationType = (tournament.sportType === 0)? 'participants' : 'teams';
        const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${orgId}/tournaments/${tournament.tournamentId}/${participationType}?${includeLimit? `page=${this.get('contestantsPage')}&limit=${this.get('limitPerPage')}`:'exclude_limit=true'}`;

        $.ajax({
            method: 'GET',
            url: apiURL,
            dataType: "json",
            contentType: "application/json",
            accepts: {
                json: "application/json"
            }
        })
        .then((data, textStatus, jqXHR) => {
            this.set(participationType, data.data);
        })
        .catch((err) => {
            console.log(err)
            messageQueueService.addPopupMessage(
                {
                    message: err.message,
                    level: 3
                }
            )
        });
    },
    fetchTournamentEvents(includeLimit=true){
        const messageQueueService = this.get('messageQueueService');

        const tournament = this.get('tournament');
        const userInfo = this.get('userInfo');
        const orgId = userInfo.organizationId;
        const config = this.get('envService');

        const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${orgId}/tournaments/${tournament.tournamentId}/events`;

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
            this.set('schedules', response.data);
        })
        .catch((err) => {
            console.log(err)
            messageQueueService.addPopupMessage({
                message: err.responseJSON.message,
                level: 3
            })
        });
    },
    registerTournament(thisRef, formData, teamRegistrationType){
        const messageQueueService = thisRef.get('messageQueueService');

        const tournament = thisRef.get('tournament');
        const userInfo = thisRef.get('userInfo');
        const orgId = userInfo.organizationId;
        const config = thisRef.get('envService');

        let apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${orgId}/tournaments/${tournament.tournamentId}/`;
        const requestData = {};

        if(tournament.sportType === 0){
            apiURL += 'participants';
            requestData.userId = userInfo.userId;
        }
        else if(teamRegistrationType === 0){
            apiURL += 'teams';
            requestData.teamLeaderId = userInfo.userId;
            requestData.teamName = formData.get('teamName');
        }
        else{
            apiURL += `teams/${formData.get('teamId')}/members`;
            requestData.userId = userInfo.userId;
        }

        $.ajax({
            method: 'POST',
            url: apiURL,
            data: JSON.stringify(requestData),
            dataType: "json",
            contentType: "application/json",
            accepts: {
                json: "application/json"
            },
            processData: false,
        })
        .then((data, textStatus, jqXHR) => {
            console.log(data, textStatus, jqXHR);
            thisRef.get('target').router.getHandler('tournaments.tournament').refresh()
            messageQueueService.addPopupMessage(
                {
                    message: "Tournament registered successfully",
                    level: 1
                }
            )
        })
        .catch((err) => {
            console.log(err);
            messageQueueService.addPopupMessage(
                {
                    message: err.responseJSON.message,
                    level: 3
                }
            )
        });
    },
    unregisterTournament(thisRef, teamRegistrationType){
        const messageQueueService = thisRef.get('messageQueueService');

        const tournament = thisRef.get('tournament');
        const userInfo = thisRef.get('userInfo');
        const orgId = userInfo.organizationId;
        const config = thisRef.get('envService');
        const userParticipation = thisRef.get('userParticipation');

        if(!userParticipation.userRegistered){
            messageQueueService.addPopupMessage(
                {
                    message: "Not yet registered",
                    level: 2
                }
            )
            return;
        }

        let apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${orgId}/tournaments/${tournament.tournamentId}/`;
        if(tournament.sportType === 0){
            apiURL += `participants/${userParticipation.participantId}`;
        }
        else if(teamRegistrationType === 0){
            apiURL += `teams/${userParticipation.teamId}`;
        }
        else{
            apiURL += `teams/${userParticipation.teamId}/member/${userParticipation.teamMemberId}`;
        }

        $.ajax({
            method: 'DELETE',
            url: apiURL,
            dataType: "json",
            contentType: "application/json",
            accepts: {
                json: "application/json"
            }
        })
        .then((data, textStatus, jqXHR) => {
            console.log(data, textStatus, jqXHR);
            thisRef.get('target').router.getHandler('tournaments.tournament').refresh();
            messageQueueService.addPopupMessage(
                {
                    message: "Tournament unregistered successfully",
                    level: 1
                }
            )
        })
        .catch((err) => {
            console.log(err);
            messageQueueService.addPopupMessage(
                {
                    message: err.message,
                    level: 3
                }
            )
        });

    },
    updateDetails(thisRef, formData, teamRegistrationType){
        const messageQueueService = thisRef.get('messageQueueService');

        const tournament = thisRef.get('tournament');
        const userInfo = thisRef.get('userInfo');
        const orgId = userInfo.organizationId;
        const config = thisRef.get('envService');
        const userParticipation = thisRef.get('userParticipation');

        if(!userParticipation.userRegistered){
            messageQueueService.addPopupMessage(
                {
                    message: "Not yet registered",
                    level: 2
                }
            )
            return;
        }

        if(tournament.sportType !== 1 || userParticipation.teamLeaderId !== userInfo.userId ){
            return;
        }

        let apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${orgId}/tournaments/${tournament.tournamentId}/teams/${userParticipation.teamId}`;

        const requestData = {};
        const newTeamName = formData.get('teamName');
        const newTeamLeaderId = formData.get('teamLeaderId');

        if(newTeamName){
            requestData.teamName = newTeamName;
        }
        if(newTeamLeaderId){
            requestData.teamLeaderId = newTeamLeaderId;
        }

        $.ajax({
            method: 'PUT',
            url: apiURL,
            data: JSON.stringify(requestData),
            dataType: "json",
            contentType: "application/json",
            accepts: {
                json: "application/json"
            },
            processData: false,
        })
        .then((data, textStatus, jqXHR) => {
            console.log(data, textStatus, jqXHR);
            thisRef.get('target').router.getHandler('tournaments.tournament').refresh();
            messageQueueService.addPopupMessage(
                {
                    message: "Details updated successfully",
                    level: 1
                }
            )
        })
        .catch((err) => {
            console.log(err);
            messageQueueService.addPopupMessage(
                {
                    message: err.message,
                    level: 3
                }
            )
        });
    },

    // controller clean up on route change
    cleanUp(){
        this.set('contestantsPage', 0);
        this.set('schedulesPage', 0);
        this.set('tournamentFormType', 0);
        this.set('tournamentScheduleFormType', 0);
        this.set('eventPageType', 0);
        this.set('schedules', null);
    },

    // Actions
    actions: {
        refreshModel(){
            this.get('target').router.getHandler('tournaments.tournament').refresh();
        },
        goBack(){
            history.back();
        },
        setSelectedSchedule(schedule){
            this.set('selectedSchedule', schedule);
        },
        setEventPageType(value){
            if(this.get('eventPageType') === value) return;
            if(value === 1 && !this.get('schedules')){
                this.fetchTournamentEvents(false);
            }
            this.set('eventPageType', value);
        },
        setTournamentFormType(value){
            if(+this.get('tournament').sportType === 1){
                if(+this.get('tournamentFormType') === 1 && value === 0){
                    this.fetchRegisteredContestants();
                }
                else if(value === 1){
                    this.fetchRegisteredContestants(false);
                }
            }
            this.set('tournamentFormType', value);
        },
        setTournamentScheduleFormType(value){
            this.set('tournamentScheduleFormType', value);
        },
        navigateNextPage(){
            const currPage = this.get('contestantsPage');
            const totalReg = this.get('tournament.registeredCount');
            const limitPerPage = this.get('limitPerPage');

            if((currPage+1) * limitPerPage >= totalReg){
                return;
            }
            
            this.set('contestantsPage', currPage + 1);
            this.get('fetchRegisteredContestants')();
        },
        navigatePreviousPage(){
            const currPage = this.get('contestantsPage');

            if(currPage === 0){
                return;
            }

            this.set('contestantsPage', currPage - 1);
            this.get('fetchRegisteredContestants')();
        },
        handleTournamentRegistration({teamRegistrationType, formData}){

            this.get('registerTournament')(this, formData, teamRegistrationType);
        },
        handleTournamentUnregistration({teamRegistrationType}){

            this.get('unregisterTournament')(this, teamRegistrationType);
        },
        handleUpdateTournamentRegistration({teamRegistrationType, formData}){
            
            this.get('updateDetails')(this, formData, teamRegistrationType);
        },
        searchContestants(searchValue){

            const orgId = this.get('userInfo').organizationId;
            const tournament = this.get('tournament');

            let participationType = null;
            let filterParticipationType = null; 

            if(+tournament.sportType === 0){
                participationType = 'participants';
                filterParticipationType = 'filter_participantname';
            }
            else if(+tournament.sportType === 1){
                participationType = 'teams';
                filterParticipationType = 'filter_teamname';
            }

            if(orgId === null || orgId === undefined){
                this.get('authenticationService').logout();
                this.transitionTo('login');
                return;
            }

            const config = this.get('envService');
            const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${orgId}/tournaments/${tournament.tournamentId}/${participationType}?${filterParticipationType}=${searchValue}&exclude_limit=true`;

            $.ajax({
                method: "GET",
                url: apiURL,
                accepts: {
                    'json' : 'application/json' 
                },
                dataType: 'json'
            })
            .then((response, textStatus, xqXHR) => {
                this.set(participationType, response.data);
            })
            .catch((err) => {
                this.get('messageQueueService').addPopupMessage(
                    {
                        message: err.message,
                        level: 4
                    }
                )
            });
        },
    }
});
