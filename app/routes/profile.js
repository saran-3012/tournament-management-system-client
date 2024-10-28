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
        
    },
    setupController(controller){
        const userInfo = this.get('userInfo');

        controller.set('user', userInfo);
    }
});
