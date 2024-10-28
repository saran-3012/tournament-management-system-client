import Ember from 'ember';
import controllerCleanup from '../../../mixins/controller-cleanup';

export default Ember.Route.extend(controllerCleanup, {
    envService:  Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    loaderService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function() {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo || {};
    }),
    beforeModel(){
        const authenticationService = this.get('authenticationService');
        if(!authenticationService.isLoggedIn){
            this.transitionTo('login');
            return;
        } 
        if(+authenticationService.userInfo.role !== 1 && +authenticationService.userInfo.role !== 2){
            this.transitionTo('dashboard');
            return;
        } 
    },
    actions: {
        willTransition(transition){
            this.controllerCleanup();
        }
    }
});
