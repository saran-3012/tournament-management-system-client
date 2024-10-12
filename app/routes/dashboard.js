import Ember from 'ember';
import $ from 'jquery';

export default Ember.Route.extend({
    authenticationService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function() {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo || {};
    }),
    requestUrl: '',
    beforeModel(){

        if(!this.get('authenticationService').isLoggedIn){
            this.transitionTo('login');
        }

        const userInfo = this.get('userInfo');
        if(userInfo.role === null || userInfo.role === undefined || userInfo.organizationId === null || userInfo.organizationId === undefined){
            this.get('authenticationService').logout();
            this.transitionTo('login');
            return;
        }

        switch(+this.get('userInfo').role){
            case 0:
                console.log("Role" , 0)
                this.set('requestUrl', `http://localhost:8080/tms/api/v1/orgs/${userInfo.organizationId}/tournaments?filter_userId=${userInfo.userId}`);
                break;
            case 1:
                console.log("Role" , 1)
                this.set('requestUrl', `http://localhost:8080/tms/api/v1/orgs/${userInfo.organizationId}/tournaments`);
                break;
            case 2:
                console.log("Role" , 2)
                this.set('requestUrl', `http://localhost:8080/tms/api/v1/orgs`);
                break;
            default:
                console.log("Role" , "default")
                this.get('authenticationService').logout();
                this.transitionTo('login');
        }
    },
    model(){
        const thisRef = this;
        return $.ajax({
            method: 'GET',
            url: this.get('requestUrl'),
            accepts: {
                'json' : 'application/json' 
            },
            dataType: 'json'
        })
        .done(function(data, textStatus, jqXHR){
            console.log("res", data, textStatus, jqXHR);
            console.log(thisRef.get('userInfo'))
            console.log(thisRef.get('userInfo').role)
            return data;
        })
        .fail(function(jqXHR, textStatus, errorThrown){
            console.log("error", jqXHR, textStatus, errorThrown);
        })
    },
    actions: {
        loading(){
            console.log("loading")
        },
        error(){
            console.log("error occured!")
            return true;
        }
    }
});
