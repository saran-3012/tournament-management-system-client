import Ember from 'ember';

export default Ember.Component.extend({
    // Component details
    tagName: 'div',
    classNames: ['participant-card'],
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

    // Actions
    actions: {
        changeParticipantStatus(newStatus){
            
            const messageQueueService = this.get('messageQueueService');
            const userInfo = this.get('userInfo');
            const participant = this.get('participant');

            if(+userInfo.role !== 1 && +userInfo.role !== 2){
                messageQueueService.addPopupMessage({
                    message: 'You are not allowed to perform this operation',
                    level: 2
                });
                return;
            } 
            if(newStatus === participant.participantStatus){
                return;
            }

            const config = this.get('envService');
            const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${userInfo.organizationId}/tournaments/${participant.tournamentId}/participants/${participant.participantId}`;
            
            $.ajax({
                method: 'PUT',
                url: apiURL,
                data: JSON.stringify({
                    participantStatus: newStatus
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
                    message: 'Participant status changed succussfully',
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
