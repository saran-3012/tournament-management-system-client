import Ember from 'ember';
import controllerCleanup from '../../mixins/controller-cleanup';

export default Ember.Route.extend(controllerCleanup, {
    envService:  Ember.inject.service(),
    loaderService: Ember.inject.service(),
    dataPersistanceService: Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function() {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo || {};
    }),

    queryParams: {
        page: {
          refreshModel: true 
        },
        sort: {
          refreshModel: true  
        },
        filter: {
            refreshModel: true  
        },
        search: {
            refreshModel: true 
        },
        order: {
            refreshModel: true 
        }
    },

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
            this.transitionTo('organizations.organization', +userInfo.organizationId);
            return;
        }
        
        const { search, filter, sort, order, page } = transition.queryParams;

        if(page && page <= 0){
            this.transitionTo('tournaments.index', {
                queryParams : {
                    search, 
                    filter, 
                    sort, 
                    order, 
                    page: undefined
                }
            });
            return;
        }

        this.get('loaderService').setIsLoading(true);
    },
    model(params){

        const dataPersistanceService = this.get('dataPersistanceService');

        const organizationId = params["organization_id"];
        const config = this.get('envService');

        const orgApiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${organizationId}`;
        
        const organizationRequest = $.ajax({
            method: 'GET',
            url: orgApiURL,
            accepts: {
                'json' : 'application/json' 
            },
            dataType: 'json'
        })
        .then((response, textStatus, jqXHR) => {
            return response.data;
        })
        .catch((err) => {
            const authStatus = err.getResponseHeader('Tms-Auth-Status');
            if(authStatus === '1'){
                this.get('authenticationService').logout();
                this.transitionTo('index');
                return;
            }
            if(err.status === 401 || err.status === 403){
                this.transitionTo('access-denied');
                return;
            }
            throw err;
        });

        let usersApiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${organizationId}/users`;

        const { search, filter, sort, order, page } = params;

        const queryArray = [];

        if(search){
            queryArray.push(`filter_username=${search}`);
        }

        if(sort){
            queryArray.push(`sort_${sort}=${order || 'asc'}`);
        }

        if(page){
            queryArray.push(`page=${page - 1}`);
        }

        const usersCountKey = `organizationUsersCount[search:${search || ''},filter:${filter || ''}]`;

        const usersCount = dataPersistanceService.getData(usersCountKey);

        if(usersCount === null){
            queryArray.push('include_userscount=true');
        }

        queryArray.push('limit=10');

        const queryString = queryArray.join('&');

        if(queryString){
            usersApiURL += '?' + queryString;
        }

        const usersRequest = $.ajax({
            method: 'GET',
            url: usersApiURL,
            accepts: {
                'json' : 'application/json' 
            },
        })
        .then((response, textStatus, jqXHR) => {
            if(jqXHR.status === 401 || jqXHR.status === 403){
                this.transitionTo('access-denied');
            }
            const responseData = response.data;
            if(usersCount === null){
                const usersCountResponse = responseData['usersCount'];
                dataPersistanceService.set(usersCountKey, usersCountResponse, 30 * 60 * 1000);
            }
            return responseData;
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
                    const [organization, usersObject] = response;
                    const {users} = usersObject;
                    const admin = users.find((user) => user.role === 1);
                    return {
                        organization,
                        usersObject,
                        admin,
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

        const params = this.paramsFor('organizations.organization');

        controller.set('filterValue', params.filter || '');
        controller.set('searchValue', params.search || '');
        controller.set('sortValue', params.sort || '')
        controller.set('orderValue', params.order || '')
        controller.set('currentPage', +params.page-1 || 0)
        controller.set('limit', 10);

        const {organization, usersObject, admin} = model;
        controller.set('organization', organization);
        controller.set('users', usersObject.users);
        controller.set('organizationUsersCount', usersObject.usersCount);
        controller.set('admin', admin);
    },
    actions: {
        willTransition(transition){
            this.controllerCleanup();
        },
        error(){
            this.get('loaderService').setIsLoading(false);
        }
    }
});
