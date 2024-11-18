import Ember from 'ember';

export default Ember.Route.extend({
    envService: Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    loaderService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function () {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo || {};
    }),
    beforeModel(){
        
        const isLoggedIn = this.get('isLoggedIn');
        if(isLoggedIn === false){
            this.transitionTo('login');
            return;
        }
    },
    model(){
        const userInfo = this.get('userInfo');
        const config = this.get('envService');
        const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${userInfo.organizationId}/users/${userInfo.userId}`;

        return $.ajax({
                method: 'GET',
                url: apiURL,
                accepts: {
                    'json' : 'application/json' 
                },
                dataType: 'json'
            })
            .then((response, textStatus, jqXHR) => {
                return response.data;
            })
            .catch((err) => {
                const authStatus = err.getResponseHeader('Tms-Auth-Status');

                if(authStatus === '1'){
                    this.get('authenticationService').logout();
                    this.transitionTo('index');
                    return;
                }
                if(err.status === 401 || err.status === 403){
                    this.transitionTo('access-denied');
                    return;
                }
            })

    },
    setupController(controller, model){
        model.profileBackgroundUrl = `images/background-images/background-image-${model.userId % 10}.png`
        controller.set('user', model);
    }
});
