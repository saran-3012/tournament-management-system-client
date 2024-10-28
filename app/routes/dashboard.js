import Ember from 'ember';

export default Ember.Route.extend({
    authenticationService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function(){
        return this.get('authenticationService').userInfo;
    }),
    isLoggedIn: Ember.computed('authenticationService.isLoggedIn', function(){
        return this.get('authenticationService').isLoggedIn;
    }),
    beforeModel(transition){
        const isLoggedIn = this.get('isLoggedIn');
        if(isLoggedIn === false){
            this.transitionTo('login');
            return;
        }
    }
});
