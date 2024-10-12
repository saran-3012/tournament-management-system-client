import Ember from 'ember';
import $ from 'jquery';

export default Ember.Controller.extend({
    envService: Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function() {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo || {};
    }),
    actions: {
        changeOrganizationStatus(orgId, newStatus){
            if(this.get('userInfo') == null || this.get('userInfo') == undefined || +this.get('userInfo').role !== 2 ){
                return;
            }
            const config = this.get('envService');
            const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${orgId}`;

            $.ajax({
                method: 'PUT',
                url: apiURL,
                data: JSON.stringify({organizationStatus : newStatus}),
                dataType: "json",
                contentType: "application/json",
                accepts: {
                    json: "application/json"
                },
                processData: false
            })
            .done(function(data, textStatus, jqXHR) {
                console.log(data, textStatus, jqXHR)
            })
            .fail(function(jqXHR, textStatus, errorThrown){
                console.log(jqXHR, textStatus, errorThrown)
            });
        }
    }
});
