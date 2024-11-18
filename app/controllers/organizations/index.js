import Ember from 'ember';

export default Ember.Controller.extend({
    envService: Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function() {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo || {};
    }),
    updateOrganization(updatedOrg){
 
        const orgs = this.get('organizations');
        const updatedOrgs = orgs.map((org) => (org.organizationId !== updatedOrg.organizationId)? org : Object.assign({}, org, updatedOrg));
        this.set('organizations', updatedOrgs);
    },

    totalPages: Ember.computed('limit', 'organizationsCount', function() {
        const limit = this.get('limit');
        const organizationUsersCount = this.get('organizationsCount');
        return Math.ceil(organizationUsersCount / limit);
    }),

     // clean up
     cleanUp(){
        this.set('filterValue', '');
        this.set('searchValue', '');
        this.set('sortValue', '');
        this.set('orderValue', '');
        this.set('currentPage', 0);

        this.set('organizationsCount', undefined);
        this.set('organizations', []);

    },

    actions: {
        refreshModel(){
            this.get('target').router.getHandler('organizations.index').refresh();
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
                this.updateOrganization(response.data);
            })
            .catch((err) => {
                console.log("error" , err);
            });
        },
        searchOrganizations(searchConfig){

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

        }
    }
});
