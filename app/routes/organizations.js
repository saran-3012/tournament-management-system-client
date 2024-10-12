import Ember from 'ember';

export default Ember.Route.extend({
    envService:  Ember.inject.service(),
    authenticationService: Ember.inject.service(),
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

        if(+this.get('userInfo').role != 2){
            this.get('authenticationService').logout();
            this.transitionTo('login');
            return;
        }
    },
    model(){
        const config = this.get('envService');
        const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs`;
        const thisRef = this;
        return $.ajax({
            method: 'GET',
            url: apiURL,
            accepts: {
                'json' : 'application/json' 
            },
            dataType: 'json'
        })
        .done(function(data, textStatus, jqXHR){
            console.log("res", data, textStatus, jqXHR);
            console.log(thisRef.get('userInfo'))
            console.log(thisRef.get('userInfo').role)
            return data;
        })
        .fail(function(jqXHR, textStatus, errorThrown){
            console.log("error", jqXHR, textStatus, errorThrown);
        })
    },
    actions: {
        loading(){
            console.log("loading")
        },
        error(){
            console.log("error occured!")
            return true;
        }
    }
});
