import Ember from 'ember';

export default Ember.Mixin.create({
    controllerCleanup(){
        const controller = this.controller;
        if(controller && typeof controller.cleanUp === 'function'){
            controller.cleanUp();
        }
    }
});
