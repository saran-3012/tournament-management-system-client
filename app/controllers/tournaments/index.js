import Ember from 'ember';

export default Ember.Controller.extend({
    // Services
    messageQueueService: Ember.inject.service(),
    envService: Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    loaderService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function () {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo || {};
    }),

    // State
    totalPages: Ember.computed('limit', 'tournamentsCount', function() {
        const limit = this.get('limit');
        const tournamentsCount = this.get('tournamentsCount');
        return Math.ceil(tournamentsCount / limit);
    }),
    isCancelPopupOpen: false,
    selectedTournament: {},

    // clean up
    cleanUp(){
        this.set('filterValue', '');
        this.set('searchValue', '');
        this.set('sortValue', '');
        this.set('orderValue', '');
        this.set('currentPage', 0);

        this.set('tournamentsCount', undefined);
        this.set('tournaments', []);

    },
    actions: {
        setIsCancelPopupOpen(value){
            this.set('isCancelPopupOpen', value);
        },
        setSelectedTournament(tournament){
            this.set('selectedTournament', tournament);
        },
        searchTournaments(searchConfig){
            
            const orgId = this.get('userInfo').organizationId;

            if(orgId === null || orgId === undefined){
                this.get('authenticationService').logout();
                this.transitionTo('login');
                return;
            }

            const searchValue = this.get('searchValue');
            const filterValue = this.get('filterValue');
            const sortValue = this.get('sortValue');
            const orderValue = this.get('orderValue');
            const page = (searchConfig.hasOwnProperty('currentPage'))? this.get('currentPage') : undefined;

            const queryParams = {
                search : searchValue || undefined,
                filter : filterValue || undefined,
                sort : sortValue || undefined,
                order : orderValue || undefined,
                page: page? +page + 1 : undefined
            };

            this.transitionToRoute({ queryParams });
            
        },
        cancelTournament(){
            const messageQueueService = this.get('messageQueueService');
            const tournament = this.get('selectedTournament');
            if(tournament === null || tournament.tournamentId === null || tournament.tournamentId === undefined){
                messageQueueService.addPopupMessage({
                    message: 'No tournament selected',
                    level: 2
                });
                return;
            }

            const userInfo = this.get('userInfo');
            if(+userInfo.role !== 1 && +userInfo.role !== 2){
                messageQueueService.addPopupMessage({
                    message: "Cannot perform this operation",
                    level: 2
                });
                return;
            }

            const tournamentId = tournament.tournamentId;
            const orgId = userInfo.organizationId;
            const config = this.get('envService');
            const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${orgId}/tournaments/${tournamentId}`;
            
            $.ajax({
                method: 'PUT',
                url: apiURL,
                headers: {
                    'Tms-Tournament-Update-Option': '0'
                },
                data: JSON.stringify({
                    tournamentData: {
                        tournamentStatus: 3
                    }
                }),
                dataType: "json",
                contentType: "application/json",
                accepts: {
                    json: "application/json"
                },
                processData: false,
            })
            .then((data, textStatus, jqXHR) => {
                this.get('target').router.getHandler('tournaments.index').refresh();
                this.set('isCancelPopupOpen', false);
                messageQueueService.addPopupMessage({
                    message: data.message,
                    level: 1
                });
            })
            .catch((err) => {
                console.log(err);
                const authStatus = err.getResponseHeader('Tms-Auth-Status');
                if(authStatus === '1'){
                    messageQueueService.addPopupMessage({
                        message: "User is not authorized",
                        level: 3
                    });
                    this.get('authenticationService').logout();
                    this.transitionToRoute('index');
                }
                else if(+err.status === 401 || +err.status === 403){
                    messageQueueService.addPopupMessage({
                        message: "User is not authorized",
                        level: 3
                    });
                }
                else{
                    messageQueueService.addPopupMessage({
                        message: "Something went wrong",
                        level: 3
                    });
                }
            });
        }
    }
});
