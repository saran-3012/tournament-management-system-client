import Ember from 'ember';

export default Ember.Route.extend({
    envService: Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    loaderService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function () {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo || {};
    }),
    beforeModel() {
        this.get('loaderService').setIsLoading(true);

        if (!this.get('authenticationService').isLoggedIn) {
            this.transitionTo('login');
            return;
        }

        const userInfo = this.get('userInfo');
        if (userInfo.role === null || userInfo.role === undefined || userInfo.organizationId === null || userInfo.organizationId === undefined) {
            this.get('authenticationService').logout();
            this.transitionTo('login');
            return;
        }

        if (+this.get('userInfo').role !== 2) {
            this.transitionTo('access-denied');
            return;
        }
    },
    model() {

        const config = this.get('envService');
        const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs`;
        console.log($.ajax())
        return $.ajax({
            method: 'GET',
            url: apiURL,
            accepts: {
                'json': 'application/json'
            },
            dataType: 'json'
        })
        .then((response) => {
            return response.data;
        })
        .catch((err) => {
            console.log("error", err);
        })
        .always(() => {
            this.get('loaderService').setIsLoading(false);
        })
    },
    actions: {
        error() {
            console.log("error occured!")
            return true;
        }
    }
});
