import Ember from 'ember';

export default Ember.Route.extend({
    envService:  Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    loaderService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function() {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo || {};
    }),
    beforeModel(transition){
        
        if(!this.get('authenticationService').isLoggedIn){
            this.transitionTo('login');
            return;
        }
        
        const userInfo = this.get('userInfo');
        if(userInfo.role === null || userInfo.role === undefined || userInfo.organizationId === null || userInfo.organizationId === undefined){
            this.get('authenticationService').logout();
            this.transitionTo('login');
            return;
        }
        
        const params = transition.params['organizations.organization'];
        const organizationId = params["organization_id"];
        
        if(+userInfo.role !== 2 && +userInfo.organizationId !== +organizationId){
            this.transitionTo('access-denied');
            return;
        }
        
        this.get('loaderService').setIsLoading(true);
    },
    model(params){
        const organizationId = params["organization_id"];
        const config = this.get('envService');
        const orgApiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${organizationId}`;
        const usersApiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${organizationId}/users`;
        
        const organizationRequest = $.ajax({
            method: 'GET',
            url: orgApiURL,
            accepts: {
                'json' : 'application/json' 
            },
            dataType: 'json'
        })
        .then((data, textStatus, jqXHR) => {
            return {
                status: jqXHR.status, 
                data: data.data,       
                message: data.message 
            };
        })
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            const authStatus = err.getResponseHeader('Tms-Auth-Status');
            if(authStatus === '1'){
                this.get('authenticationService').logout();
                this.transitionToRoute('index');
                return;
            }
            if(err.status === 401 || err.status === 403){
                this.transitionTo('access-denied');
                return;
            }
            throw err;
        });

        const usersRequest = $.ajax({
            method: 'GET',
            url: usersApiURL,
            accepts: {
                'json' : 'application/json' 
            },
        })
        .then((data, textStatus, jqXHR) => {
            return {
                status: jqXHR.status, 
                data: data.data,       
                message: data.message 
            };
        })
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            const authStatus = err.getResponseHeader('X-Auth-Status');
            if(authStatus === '1'){
                this.get('authenticationService').logout();
                this.transitionToRoute('index');
                return;
            }
            if(err.status === 401 || err.status === 403){
                this.transitionTo('access-denied');
                return;
            }
            throw err;
        });

        return  Promise.all([organizationRequest, usersRequest])
                .then((response) => {
                    const [organization, users] = response;
                    const admin = users.find((user) => user.role === 1);
                    return {
                        organization,
                        users,
                        admin
                    };
                })
                .catch((err) => {
                    console.log(err);
                })
                .finally(() => {
                    this.get('loaderService').setIsLoading(false);
                });
    },
    setupController(controller, model){
        this.get('loaderService').setIsLoading(false);
        controller.set('organization', model.organization);
        controller.set('users', model.users);
        controller.set('admin', model.admin);
    }
});
