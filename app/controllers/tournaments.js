import Ember from 'ember';

export default Ember.Controller.extend({
    authenticationService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function(){
        return this.get('authenticationService').userInfo;
    })
});
