import Ember from 'ember';
import ControllerCleanup from '../mixins/controller-cleanup';

export default Ember.Route.extend(ControllerCleanup, {
    authenticationService: Ember.inject.service(),
    beforeModel(){
        const authenticationService = this.get('authenticationService');
        if(authenticationService.isLoggedIn){
            this.transitionTo('dashboard');
        }
    },
    actions: {
        willTransition(transition){
            this.controllerCleanup();
        }
    }
});
