import Ember from 'ember';
import ControllerCleanup from '../mixins/controller-cleanup';

export default Ember.Route.extend(ControllerCleanup, {

    authenticationService : Ember.inject.service(),
    beforeModel(){
        const self = this;
        this.get('authenticationService').checkin(function(){
            self.transitionTo('index');
        });
    },
    actions: {
        willTransition(transition){
            this.controllerCleanup();
        }
    }
});
