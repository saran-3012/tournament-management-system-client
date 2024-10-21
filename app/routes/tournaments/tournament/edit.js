import Ember from 'ember';
import controllerCleanup from '../../../mixins/controller-cleanup';

export default Ember.Route.extend(controllerCleanup, {
    actions: {
        willTransition(transition){
            this.controllerCleanup();
        }
    }
});
