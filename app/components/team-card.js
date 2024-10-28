import Ember from 'ember';

export default Ember.Component.extend({
    // Component details
    tagName: 'div',
    classNames: ['team-card'],
    attributeBindings: ['title'],

    // Services
    messageQueueService: Ember.inject.service(),
    envService: Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    loaderService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function () {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo || {};
    }),

    // States
    isMembersPanelOpen: false,

    // API calls
    fetchTeamMembers(thisRef){
        const userInfo = thisRef.get('userInfo');
        const team = thisRef.get('team');
        const config = thisRef.get('envService');
        const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${userInfo.organizationId}/tournaments/${team.tournamentId}/teams/${team.teamId}/members?exclude_limit=true`;

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
            thisRef.set('members', response.data);
        })
        .catch((err) => {
            thisRef.get('messageQueueService').addPopupMessage({
                message: err.responseJSON.message,
                level: 3
            })
        });
    },
   
    actions: {
        toggleMembersPanelOpen(){
            this.toggleProperty('isMembersPanelOpen');
            const isMembersPanelOpen = this.get('isMembersPanelOpen');
            if(isMembersPanelOpen && !this.get('members')){
                this.get('fetchTeamMembers')(this);
            };
        },
        removeTeamMember(teamMemberId){
            const messageQueueService = this.get('messageQueueService');
            const userInfo = this.get('userInfo');
            const team = this.get('team');
    
            if(userInfo.userId !== team.teamLeaderId){
                messageQueueService.addPopupMessage({
                    message: 'You are not allowed to perform this operation',
                    level: 2
                });
                return;
            }
            const config = this.get('envService');
            const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${userInfo.organizationId}/tournaments/${team.tournamentId}/teams/${team.teamId}/members/${teamMemberId}`;
    
            $.ajax({
                method: 'DELETE',
                url: apiURL,
                accepts: {
                    json: 'application/json'
                },
                dataType: 'json',
                contentType: "application/json",
            })
            .then((response, textStatus, jqXHR) => {
                this.get('refreshModel')();
                messageQueueService.addPopupMessage({
                    message: 'Member removed successfully',
                    level: 1
                });
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
                messageQueueService.addPopupMessage({
                    message: err.responseJSON.message,
                    level: 3
                });
            })
        },
        changeTeamStatus(newStatus){
            
            const messageQueueService = this.get('messageQueueService');
            const userInfo = this.get('userInfo');
            const team = this.get('team');

            if(+userInfo.role !== 1 && +userInfo.role !== 2){
                messageQueueService.addPopupMessage({
                    message: 'You are not allowed to perform this operation',
                    level: 2
                });
                return;
            } 
            if(newStatus === team.teamStatus){
                return;
            }

            const config = this.get('envService');
            const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${userInfo.organizationId}/tournaments/${team.tournamentId}/teams/${team.teamId}`;
            
            $.ajax({
                method: 'PUT',
                url: apiURL,
                data: JSON.stringify({
                    teamStatus: newStatus
                }),
                dataType: "json",
                contentType: "application/json",
                accepts: {
                    json: "application/json"
                },
                processData: false,
            })
            .then((response, textStatus, jqXHR) => {
                this.get('refreshModel')();
                messageQueueService.addPopupMessage({
                    message: 'Team status changed succussdully',
                    level: 1
                });
            })
            .catch((err) => {
                messageQueueService.addPopupMessage({
                    message: err.responseJSON.message,
                    level: 3
                });
            })
        }
    }
});
