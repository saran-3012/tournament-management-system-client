import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['organization-card'],

    authenticationService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function () {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo || {};
    }),
    organization : {},
    actions: {
        approveOrganization(){
            this.get('changeOrganizationStatus')(this.get('organization').organizationId, 1);
        },
        blockOrganization(){
            this.get('changeOrganizationStatus')(this.get('organization').organizationId, 2);
        },
        unblockOrganization(){
            this.get('changeOrganizationStatus')(this.get('organization').organizationId, 1);
        }
    }
});
