import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['tournament-navbar'],
    authenticationService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function() {
        return this.get('authenticationService').userInfo;
    }),
    isLoggedIn: Ember.computed.readOnly('authenticationService.isLoggedIn'),

    init() {
        this._super(...arguments);

        this.set('filterOptions', [
            { value: '', displayName: 'Filter', selected: true, disabled: true, hidden: true },
            { value: '', displayName: 'All'},
            { value: 'upcomingtournaments', displayName: 'Upcoming' },
            { value: 'ongoingtournaments', displayName: 'Ongoing' },
            { value: 'completedtournaments', displayName: 'Completed' },
            { value: 'cancelledtournaments', displayName: 'Cancelled' },
            { value: `registered`, displayName: 'Registered' },
            { value: 'individualsports', displayName: 'Individual' },
            { value: 'teamsports', displayName: 'Team' },
        ]);

        this.set('sortOptions', [
            { value: '', displayName: 'Sort', selected: true, disabled: true, hidden: true },
            { value: '', displayName: 'None' },
            { value: 'timecreated', displayName: 'Time Created' },
            { value: 'registrationstart', displayName: 'Registration Start' },
            { value: 'registrationend', displayName: 'Registration End' },
            { value: 'tournamentdate', displayName: 'Tournament Date' },
            { value: 'tournamentname', displayName: 'Name' },
            { value: 'sportname', displayName: 'Sport Name' },
        ]);

        this.set('orderOptions', [
            { value: '', displayName: 'Order', selected: true, disabled: true, hidden: true },
            { value: '', displayName: 'None' },
            { value: 'asc', displayName: 'Ascending'},
            { value: 'desc', displayName: 'Descending'}
        ]);
    },

    actions: {
        prevPage(){
            const currentPage = +this.get('currentPage');
            if(currentPage > 0){
                this.set('currentPage', currentPage - 1);
                this.get('searchTournaments')({currentPage});
            }
        },
        nextPage(){
            const currentPage = +this.get('currentPage');
            const totalPages = this.get('totalPages');
            
            if(currentPage < totalPages - 1){
                this.set('currentPage', currentPage + 1);
                this.get('searchTournaments')({currentPage});
            }
        }
    }

   
    
});
