import Ember from 'ember';

export default Ember.Controller.extend({
    


    createTournament(formData){
        const userInfo = this.get('userInfo');
        const orgId = userInfo.organizationId;
        const config = this.get('envService');
        const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${orgId}/tournaments`;
        
        $.ajax({
            method: 'POST',
            url: apiURL,
            accepts: {
                'json' : 'application/json' 
            },
            dataType: 'json'
        })
        .then(() => {

        })
        .catch(() => {

        });
    }
});

