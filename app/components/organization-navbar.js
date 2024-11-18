import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['organization-navbar'],
    authenticationService: Ember.inject.service(),
    isLoggedIn: Ember.computed.readOnly('authenticationService.isLoggedIn'),
    userInfo: Ember.computed('authenticationService.userInfo', function() {
        return this.get('authenticationService').userInfo;
    }),
    
    init() {
        this._super(...arguments);
        
        console.log(this.get('totalPages'))

        this.set('filterOptions', [
            { value: '', displayName: 'Filter', selected: true, disabled: true, hidden: true },
            { value: '', displayName: 'All'},
            { value: 'unapprovedorganizations', displayName: 'Unapproved' },
            { value: 'approvedorganizations', displayName: 'Approved' },
            { value: 'bannedorganizations', displayName: 'Banned' },
        ]);

        this.set('sortOptions', [
            { value: '', displayName: 'Sort', selected: true, disabled: true, hidden: true },
            { value: '', displayName: 'None' },
            { value: 'timecreated', displayName: 'Time Created' },
            { value: 'organizationname', displayName: 'Name' },
            { value: 'startedyear', displayName: 'Year' },
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
                this.get('searchOrganizations')({currentPage});
            }
        },
        nextPage(){
            const currentPage = +this.get('currentPage');
            const totalPages = this.get('totalPages');
            
            if(currentPage < totalPages - 1){
                this.set('currentPage', currentPage + 1);
                this.get('searchOrganizations')({currentPage});
            }
        }
    }
});
