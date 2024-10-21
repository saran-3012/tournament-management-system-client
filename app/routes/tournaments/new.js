import Ember from 'ember';
import controllerCleanup from '../../mixins/controller-cleanup';

export default Ember.Route.extend(controllerCleanup, {
    envService:  Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    loaderService: Ember.inject.service(),
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

        if(userInfo.role !== 1 && userInfo.role !== 2){
            this.transitionTo('index');
            return;
        }
    },
    actions: {
        willTransition(transition){
            this.controllerCleanup();
        }
    }
});
