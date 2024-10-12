import Ember from 'ember';
import ControllerCleanup from '../mixins/controller-cleanup';

export default Ember.Route.extend(ControllerCleanup, {
    actions: {
        willTransition(transition){
            this.controllerCleanup();
        }
    }
});
