import Ember from 'ember';
import controllerCleanup from '../../mixins/controller-cleanup';

export default Ember.Route.extend(controllerCleanup, {
    envService: Ember.inject.service(),
    dataPersistanceService: Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    loaderService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function () {
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

    beforeModel(transition) {

        if (!this.get('authenticationService').isLoggedIn) {
            this.transitionTo('login');
            return;
        }
        
        const userInfo = this.get('userInfo');
        if (userInfo.role === null || userInfo.role === undefined || userInfo.organizationId === null || userInfo.organizationId === undefined) {
            this.get('authenticationService').logout();
            this.transitionTo('login');
            return;
        }
        
        if (+this.get('userInfo').role !== 2) {
            this.transitionTo('access-denied');
            return;
        }

        const { search, filter, sort, order, page } = transition.queryParams;

        if(+page && +page <= 0){
            this.transitionTo('organizations.index', {
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
    
    model(params) {

        const dataPersistanceService = this.get('dataPersistanceService');

        const config = this.get('envService');
        let apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs`;

        const { search, filter, sort, order, page } = params;


        const queryArray = [];

        if(search){
            queryArray.push(`filter_organization=${search}`);
        }

        switch(filter || ''){
            case 'unapprovedorganizations':
                queryArray.push('filter_organizationstatus=0');
                break;
            
            case 'approvedorganizations':
                queryArray.push('filter_organizationstatus=1');
                break;
            
            case 'bannedorganizations':
                queryArray.push('filter_organizationstatus=2');
                break;
            default:;
        }

        if(sort){
            queryArray.push(`sort_${sort}=${order || 'asc'}`);
        }

        if(page){
            queryArray.push(`page=${page - 1}`);
        }

        const organizationsCountKey = `organizationsCount[search:${search || ''},filter:${filter || ''}]`;

        const organizationsCount = dataPersistanceService.getData(organizationsCountKey);

        if(organizationsCount === null){
            queryArray.push('include_organizationscount=true');
        }

        queryArray.push('limit=8');

        const queryString = queryArray.join('&');

        if(queryString){
            apiURL += '?' + queryString;
        }

        
        return $.ajax({
            method: 'GET',
            url: apiURL,
            accepts: {
                'json': 'application/json'
            },
            dataType: 'json'
        })
        .then((response) => {
            return response.data;
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
        })
        .always(() => {
            this.get('loaderService').setIsLoading(false);
        })
    },

    setupController(controller, model){
        this._super(...arguments);
        
        const params = this.paramsFor('organizations.index');
        controller.set('filterValue', params.filter || '');
        controller.set('searchValue', params.search || '');
        controller.set('sortValue', params.sort || '')
        controller.set('orderValue', params.order || '')
        controller.set('currentPage', +params.page-1 || 0)
        controller.set('limit', 8);

        const {organizations, organizationsCount} = model;
        controller.set('organizations', organizations);
        if(organizationsCount !== undefined){
            controller.set('organizationsCount', organizationsCount);
        }
        
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
