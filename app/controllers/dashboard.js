import Ember from 'ember';

export default Ember.Controller.extend({
    messageQueueService: Ember.inject.service(),
    envService: Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    loaderService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function () {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo || {};
    }),
    cleanUp(){
        
    },

    actions: {
        refreshModel(){
            this.get('target').refresh();
        },
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
                console.log(this)
                this.get('target').router.getHandler('dashboard').refresh();
            })
            .catch((err) => {
                console.log("error" , err);
            });
        },
    }
});
