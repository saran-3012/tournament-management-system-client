import Ember from 'ember';

export default Ember.Controller.extend({
    envService: Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function() {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo || {};
    }),
    updateOrganization(updatedOrg){
        this._super()
        const orgs = this.get('model');
        const updatedOrgs = orgs.map((org) => (org.organizationId !== updatedOrg.organizationId)? org : Object.assign({}, org, updatedOrg));
        this.set('model', updatedOrgs);
    },
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
            .then((response) => {
                this.updateOrganization(response.data);
            })
            .catch((err) => {
                console.log("error" , err);
            });
        },
        searchOrganizations(searchValue){
            const userInfo = this.get('userInfo');
            
            if(+userInfo.role !== 2){
                this.transitionTo('index');
                return;
            }

            const config = this.get('envService');
            const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs?filter_orgname=${searchValue}`;

            $.ajax({
                method: "GET",
                url: apiURL,
                accepts: {
                    'json' : 'application/json' 
                },
                dataType: 'json'
            })
            .then((response, textStatus, xqXHR) => {
                this.set('organizations', response.data);
            })
            .catch((err) => {
                this.get('messageQueueService').addPopupMessage(
                    {
                        message: err.message,
                        level: 4
                    }
                )
            })
        }
    }
});
