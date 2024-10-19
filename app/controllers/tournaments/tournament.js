import Ember from 'ember';
import $ from 'jquery';

export default Ember.Controller.extend({
    envService:  Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    loaderService: Ember.inject.service(),
    messageQueueService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function() {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo || {};
    }),
    contestantsPage: 0,
    limitPerPage: 20,
    tournamentFormType: 0,
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
                    message: err.message,
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
            thisRef.get('target').router.getHandler('tournaments.tournament').refresh()
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
    actions: {
        setTournamentFormType(value){
            if(value === 0){
                this.fetchRegisteredContestants();
            }
            else{
                this.fetchRegisteredContestants(false);
            }
            this.set('tournamentFormType', value);
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
        handleTournamentRegistration({event, teamRegistrationType}){
            event.preventDefault();
            const formData = new FormData(event.target);
            this.get('registerTournament')(this, formData, teamRegistrationType);
        },
        handleTournamentUnregistration({event, teamRegistrationType}){
            event.preventDefault();
            this.get('unregisterTournament')(this, teamRegistrationType);
        },
        handleUpdateTournamentRegistration({event, teamRegistrationType}){
            event.preventDefault();
            const formData = new FormData(event.target);
            this.get('updateDetails')(this, formData, teamRegistrationType);
        }
    }
});
