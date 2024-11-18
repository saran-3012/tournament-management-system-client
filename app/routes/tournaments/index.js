import Ember from 'ember';
import controllerCleanup from '../../mixins/controller-cleanup';

export default Ember.Route.extend(controllerCleanup, {
    envService:  Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    loaderService: Ember.inject.service(),
    dataPersistanceService: Ember.inject.service(),
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
        
        if(+userInfo.role === 2){
            this.transitionTo('index');
            return;
        }
        
        if(+userInfo.role !== 0 && +userInfo.role !== 1){
            this.get('authenticationService').logout();
            this.transitionTo('login');
            return;
        }

        if(userInfo.organizationId === null || userInfo.organizationId === undefined){
            this.get('authenticationService').logout();
            this.transitionTo('login');
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

        const userInfo = this.get('userInfo');
        const orgId = userInfo.organizationId;
        
        const config = this.get('envService');
        let apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${orgId}/tournaments`;

        const { search, filter, sort, order, page } = params;

        const queryArray = [];

        if(search){
            queryArray.push(`filter_tournament=${search}`);
        }

        switch(filter || ''){
            case 'upcomingtournaments':
                queryArray.push('filter_tournamentstatus=0');
                break;
            
            case 'ongoingtournaments':
                queryArray.push('filter_tournamentstatus=1');
                break;
            
            case 'completedtournaments':
                queryArray.push('filter_tournamentstatus=2');
                break;
            
            case 'cancelledtournaments':
                queryArray.push('filter_tournamentstatus=3');
                break;
            
            case 'registered':
                queryArray.push(`filter_userid=${userInfo.userId}`);
                break;
            
            case 'individualsports':
                queryArray.push('filter_sporttype=0');
                break;

            case 'teamsports':
                queryArray.push('filter_sporttype=1');
                break;
            default:;
        }

        if(sort){
            queryArray.push(`sort_${sort}=${order || 'asc'}`);
        }

        if(page){
            queryArray.push(`page=${page - 1}`);
        }

        const tournamentsCountKey = `tournamentsCount[search:${search || ''},filter:${filter || ''}]`;

        const tournamentsCount = dataPersistanceService.getData(tournamentsCountKey);


        if(tournamentsCount === null){
            queryArray.push('include_tournamentscount=true');
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
                'json' : 'application/json' 
            },
            dataType: 'json'
        })
        .then((response, textStatus, jqXHR) => {
            if(jqXHR.status === 401 || jqXHR.status === 403){
                this.transitionTo('access-denied');
            }
            const responseData = response.data;
            if(tournamentsCount === null){
                const tournamentsCountResponse = responseData['tournamentsCount'];
                dataPersistanceService.set(tournamentsCountKey, tournamentsCountResponse, 30 * 60 * 1000);
            }

            return responseData;
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
        })
        .always(() => {
            this.get('loaderService').setIsLoading(false);
        });

    },
    setupController(controller, model){
        this._super(...arguments);
        
        const params = this.paramsFor('tournaments.index');
        controller.set('filterValue', params.filter || '');
        controller.set('searchValue', params.search || '');
        controller.set('sortValue', params.sort || '')
        controller.set('orderValue', params.order || '')
        controller.set('currentPage', +params.page-1 || 0)
        controller.set('limit', 8);

        const {tournamentsCount, tournaments} = model;
        controller.set('tournaments', tournaments);
        if(tournamentsCount !== undefined){
            controller.set('tournamentsCount', tournamentsCount);
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
