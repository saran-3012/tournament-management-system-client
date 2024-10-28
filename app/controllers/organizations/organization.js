import Ember from 'ember';

export default Ember.Controller.extend({
    envService:  Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    loaderService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function() {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo || {};
    }),

    isOrganizationFormOpen: false,
    organizationUserFormType: 0,
    selectedUser: {},
    actions: {
        refreshModel(){
            this.get('target').router.getHandler('organizations.organization').refresh();
        },
        setIsOrganizationFormOpen(value){
            this.set('isOrganizationFormOpen', value);
        },
        setOrganizationUserFormType(value){
            this.set('organizationUserFormType', value);
        },
        setSelectedUser(user){
            this.set('selectedUser', user);
        },
        searchOrganizationUsers(searchValue){
            const userInfo = this.get('userInfo');
            
            let orgId = null;

            orgId = (+userInfo.role === 2)? this.get('organization').organizationId : userInfo.organizationId;


            if((orgId === null || orgId === undefined) && +userInfo.role !== 2){
                this.get('authenticationService').logout();
                this.transitionTo('login');
                return;
            }

            const config = this.get('envService');
            const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${orgId}/users?filter_username=${searchValue}`;

            $.ajax({
                method: "GET",
                url: apiURL,
                accepts: {
                    'json' : 'application/json' 
                },
                dataType: 'json'
            })
            .then((response, textStatus, xqXHR) => {
                this.set('users', response.data);
            })
            .catch((err) => {
                this.get('messageQueueService').addPopupMessage(
                    {
                        message: err.message,
                        level: 4
                    }
                )
            })
        },
        updateOrganizationDetails(formData){
            const organization = this.get('organization');
            const requestBody = {};

            requestBody.organizationName = formData.get('organizationName');
            requestBody.organizationAddress = formData.get('organizationAddress');
            requestBody.startedYear = formData.get('startedYear');

            const config = this.get('envService');
            const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${organization.organizationId}`;

            $.ajax({
                method: 'PUT',
                url: apiURL,
                data: JSON.stringify(requestBody),
                dataType: "json",
                contentType: "application/json",
                accepts: {
                    json: "application/json"
                },
                processData: false,
            })
            .then((response, textStatus, jqXHR) => {
                 console.log(response);
            })
            .catch((err) => {
                console.log(err)
            })
        }
    }
});
