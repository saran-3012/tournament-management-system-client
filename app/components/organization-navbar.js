import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['organization-navbar'],
    authenticationService: Ember.inject.service(),
    isLoggedIn: Ember.computed.readOnly('authenticationService.isLoggedIn'),
    userInfo: Ember.computed('authenticationService.userInfo', function() {
        return this.get('authenticationService').userInfo;
    }),
    
});
