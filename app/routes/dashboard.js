import Ember from 'ember';
import controllerCleanup from '../mixins/controller-cleanup';

export default Ember.Route.extend(controllerCleanup, {
    envService: Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    loaderService: Ember.inject.service(),
    messageQueueService: Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function(){
        return this.get('authenticationService').userInfo;
    }),
    isLoggedIn: Ember.computed('authenticationService.isLoggedIn', function(){
        return this.get('authenticationService').isLoggedIn;
    }),
    beforeModel(transition){
        const isLoggedIn = this.get('isLoggedIn');
        if(isLoggedIn === false){
            this.transitionTo('login');
            return;
        }
    },
    model(){
        const messageQueueService = this.get('messageQueueService');
        const userInfo = this.get('userInfo');
        const config = this.get('envService');
        const baseUrl = config.getEnv('BASE_API_URL');

        const roleBasedApis = [];

        if(+userInfo.role === 0 || +userInfo.role === 1){
            const registeredTournamentsApiURL = `${baseUrl}/api/v1/orgs/${userInfo.organizationId}/tournaments?filter_userid=${+userInfo.userId}`;
    
            const registeredTournamentsCall = $.ajax({
                method: 'GET',
                url: registeredTournamentsApiURL,
                accepts: {
                    'json' : 'application/json' 
                },
                dataType: 'json',
                contentType: 'application/json'
    
            })
            .then((response, textStatus, jqXHR) => {
                return response.data.tournaments;
            })
            .catch((err) => {

                console.log(err)
                throw new Error(err.responseJSON.message);
            });
    
            const upcomingSchedulesApiURL = `${baseUrl}/api/v1/orgs/${userInfo.organizationId}/users/${userInfo.userId}/events`;
    
            const upcomingSchedulesCall = $.ajax({
                method: 'GET',
                url: upcomingSchedulesApiURL,
                accepts: {
                    'json' : 'application/json' 
                },
                dataType: 'json',
                contentType: 'application/json'
            })
            .then((response, textStatus, jqXHR) => {
                return response.data;
            })
            .catch((err) => {
                console.log(err)
                throw new Error(err.responseJSON.message);
            });

            const featuredTournamentsApiURL = `${baseUrl}/api/v1/orgs/${userInfo.organizationId}/tournaments?limit=10&page=0`;

            const featuredTournamentsCall = $.ajax({
                method: 'GET',
                url: featuredTournamentsApiURL,
                accepts: {
                    'json' : 'application/json' 
                },
                dataType: 'json',
                contentType: 'application/json'
            })
            .then((response, textStatus, jqXHR) => {
                return response.data.tournaments;
            })
            .catch((err) => {
                console.log(err)
                throw new Error(err.responseJSON.message);
            });

            roleBasedApis.push(registeredTournamentsCall, upcomingSchedulesCall, featuredTournamentsCall);
        }
        else if(+userInfo.role === 2){
            const unapprovedOrganizationsApiURL = `${baseUrl}/api/v1/orgs?filter_organizationstatus=0`;

            const unapprovedOrganizationsCall = $.ajax({
                method: 'GET',
                url: unapprovedOrganizationsApiURL,
                accepts: {
                    'json' : 'application/json' 
                },
                dataType: 'json',
                contentType: 'application/json'
            })
            .then((response, textStatus, jqXHR) => {
                return response.data.organizations;
            })
            .catch((err) => {
                throw new Error(err.responseJSON.message);
            });

            const approvedOrganizationsApiURL = `${baseUrl}/api/v1/orgs?filter_organizationstatus=1`;

            const approvedOrganizationsCall = $.ajax({
                method: 'GET',
                url: approvedOrganizationsApiURL,
                accepts: {
                    'json' : 'application/json' 
                },
                dataType: 'json',
                contentType: 'application/json'
            })
            .then((response, textStatus, jqXHR) => {
                return response.data.organizations;
            })
            .catch((err) => {
                throw new Error(err.responseJSON.message);
            });

            const bannedOrganizationsApiURL = `${baseUrl}/api/v1/orgs?filter_organizationstatus=2`;

            const bannedOrganizationsCall = $.ajax({
                method: 'GET',
                url: bannedOrganizationsApiURL,
                accepts: {
                    'json' : 'application/json' 
                },
                dataType: 'json',
                contentType: 'application/json'
            })
            .then((response, textStatus, jqXHR) => {
                return response.data.organizations;
            })
            .catch((err) => {
                console.log(err)
                throw new Error(err.responseJSON.message);
            });

            roleBasedApis.push(unapprovedOrganizationsCall, approvedOrganizationsCall, bannedOrganizationsCall);
        }

        return Promise.all(roleBasedApis)
        .then((response) => {
            if(+userInfo.role === 0 || +userInfo.role === 1){
                const [registeredTournaments, upcomingSchedules, featuredTournaments] = response;
                return {
                    registeredTournaments,
                    upcomingSchedules,
                    featuredTournaments
                }
            }
            else if(+userInfo.role === 2){
                const [unapprovedOrganizations, approvedOrganizations, bannedOrganizations] = response;
                return {
                    unapprovedOrganizations,
                    approvedOrganizations,
                    bannedOrganizations
                }
            }
        })
        .catch((err) => {
            messageQueueService.addPopupMessage({
                message: err.message,
                level: 3
            })
        })

    },
    setupController(controller, model){
        const userInfo = this.get('userInfo');

        if(+userInfo.role === 0 || +userInfo.role === 1) {
            const {registeredTournaments, upcomingSchedules, featuredTournaments} = model;
            const registeredActiveTournaments = registeredTournaments.filter((tournament) => (+tournament.tournamentStatus === 0 || +tournament.tournamentStatus === 1));
            
            controller.set('registeredTournaments', registeredTournaments);
            controller.set('registeredActiveTournaments', registeredActiveTournaments);
            controller.set('upcomingSchedules', upcomingSchedules);
            controller.set('featuredTournaments', featuredTournaments);
        }
        else if(+userInfo.role === 2){
            const { unapprovedOrganizations, approvedOrganizations, bannedOrganizations } = model;

            controller.set('unapprovedOrganizations', unapprovedOrganizations);
            controller.set('approvedOrganizations', approvedOrganizations);
            controller.set('bannedOrganizations', bannedOrganizations);
        }
    },
    actions: {
        willTransition(transition){
            this.controllerCleanup();
        }
    }
});
