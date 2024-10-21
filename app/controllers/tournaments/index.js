import Ember from 'ember';

export default Ember.Controller.extend({
    messageQueueService: Ember.inject.service(),
    envService: Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    loaderService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function () {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo || {};
    }),
    actions: {
        searchTournaments(searchValue){

            const orgId = this.get('userInfo').organizationId;

            if(orgId === null || orgId === undefined){
                this.get('authenticationService').logout();
                this.transitionTo('login');
                return;
            }

            const config = this.get('envService');
            const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${orgId}/tournaments?filter_tournament=${searchValue}`;

            $.ajax({
                method: "GET",
                url: apiURL,
                accepts: {
                    'json' : 'application/json' 
                },
                dataType: 'json'
            })
            .then((response, textStatus, xqXHR) => {
                this.set('tournaments', response.data);
            })
            .catch((err) => {
                this.get('messageQueueService').addPopupMessage(
                    {
                        message: err.message,
                        level: 4
                    }
                )
            })
        }
    }
});
