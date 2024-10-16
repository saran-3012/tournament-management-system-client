import Ember from 'ember';

export default Ember.Controller.extend({
    authenticationService: Ember.inject.service(),
    loaderService: Ember.inject.service(),
    isLoading: Ember.computed('loaderService.isLoading', function() {
        return this.get('loaderService.isLoading');
    })
});
