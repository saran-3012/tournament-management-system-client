import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['tournament-navbar'],
    authenticationService: Ember.inject.service(),
    isLoggedIn: Ember.computed.readOnly('authenticationService.isLoggedIn'),
    userName: Ember.computed('authenticationService.userInfo', function() {
        let userInfo = this.get('authenticationService').userInfo;
        return userInfo.userName.split(' ')[0] || 'User';
    }),
    userRole: Ember.computed('authenticationService.userInfo', function() {
        let userInfo = this.get('authenticationService').userInfo;
        return userInfo.role || 0;
    }),
    userInfo: Ember.computed('authenticationService.userInfo', function() {
        return this.get('authenticationService').userInfo;
    }),
    
});
