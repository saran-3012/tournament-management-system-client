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

    totalPages: Ember.computed('limit', 'organizationUsersCount', function() {
        const limit = this.get('limit');
        const organizationUsersCount = this.get('organizationUsersCount');
        return Math.ceil(organizationUsersCount / limit);
    }),

    // clean up
    cleanUp(){
        this.set('filterValue', '');
        this.set('searchValue', '');
        this.set('sortValue', '');
        this.set('orderValue', '');
        this.set('currentPage', 0);

        this.set('organizationUsersCount', undefined);
        this.set('users', []);

    },

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
        searchOrganizationUsers(searchConfig){

            const userInfo = this.get('userInfo');
            
            const orgId = (+userInfo.role === 2)? this.get('organization').organizationId : userInfo.organizationId;

            if(orgId === null || orgId === undefined){
                if(+userInfo.role === 2){
                    this.transitionTo('organizations');
                    return;
                }
                else{
                    this.get('authenticationService').logout();
                    this.transitionTo('login');
                    return;
                }
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
