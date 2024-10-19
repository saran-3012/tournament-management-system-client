import Ember from 'ember';
import tournament from './tournament';
import dateTimeToMills from '../../utils/date-time-to-mills';

export default Ember.Controller.extend({
    messageQueueService: Ember.inject.service(),
    envService:  Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    loaderService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function() {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo || {};
    }),
    // validationConfig: {
    //     tournamentName: [
    //         { required: true, message: "Tournament name is required!" },
    //         { minLength: 3, message: "Tournament name must be atleast 3 characters long" },
    //         { maxLength: 50, message: "Tournament name must be less than 50 characters" }
    //     ],
    //     tournamentdate : [
    //         { 
    //             validator(date){
    //                 if(!date){
    //                     return true;
    //                 }
    //                 const isLeapYear = year => {
    //                     if (year/400){
    //                         return true;
    //                     }
    //                     else if(year/100){
    //                         return false;
    //                     }
    //                     else if(year/4){
    //                         return true;
    //                     }
    //                     return false;
                        
    //                 };

    //                 const getDaysCount = (month, year) => {
    //                     switch(month){
    //                         case 1:
    //                         case 3:
    //                         case 5:
    //                         case 7:
    //                         case 8:
    //                         case 10:
    //                         case 12:
    //                             return 31;
    //                         case 2:
    //                             return 28 + isLeapYear(year);
    //                         default:
    //                             return 30;
    //                     }
    //                 };

    //                 const [day, month, year] = date.split("/").map(Number);
                    
    //                 if(!month || month < 1 || month > 12){
    //                     return false;
    //                 }

    //                 if(!day || day < 1 || day > getDaysCount(month, year)){
    //                     return false;
    //                 }

    //                 if(!year || year > new Date().getFullYear()){
    //                     return false;
    //                 }

    //                 return true;
    //             }, 
    //             message: "Provided date is not valid format"
    //         }
    //     ],
        
    // },
    // validationErrors: {},
    // setErrors(validationErrors){
    //     this.set('validationErrors', validationErrors);
    // },
    // cleanUp(){
    //     this.setErrors({});
    // },
    createTournament(formData){

        const tournamentData = {};
        const sportData = {};

        for(const key of ['tournamentName', 'tournamentVenue', 'maxParticipation']){
            if(!formData.get(key)) continue;
            tournamentData[key] = formData.get(key);
        }

        if(formData.get('tournamentDate')){
            tournamentData['tournamentDate'] = dateTimeToMills(formData.get('tournamentDate'));
        }
        tournamentData['registrationStartDate'] = dateTimeToMills(formData.get('registrationStartDate'));
        tournamentData['registrationEndDate'] = dateTimeToMills(formData.get('registrationEndDate'));

        for(const key of ['sportName', 'sportType', 'teamSize']){
            sportData[key] = formData.get(key);
        }

        const userInfo = this.get('userInfo');
        const orgId = userInfo.organizationId;
        const config = this.get('envService');
        const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${orgId}/tournaments`;

        
        $.ajax({
            method: 'POST',
            url: apiURL,
            data: JSON.stringify({tournamentData, sportData}),
            dataType: "json",
            contentType: "application/json",
            accepts: {
                json: "application/json"
            },
            processData: false,
        })
        .then((date, textStatus, jqXHR) => {
            console.log(data);
        })
        .catch((err) => {
            console.log(err);
            const authStatus = err.getResponseHeader('X-Auth-Status');
            if(authStatus === '1'){
                this.get('authenticationService').logout();
                this.transitionToRoute('index');
            }
        });
    },
    actions: {
        handleSubmit(event){
            event.preventDefault();

            const formData = new FormData(event.target);
            // const [validationErrors, hasErrors] = formValidator(formData, this.get('validationConfig'));
            // formData.set('email', formData.get('email').toLowerCase());
            // if(hasErrors){
            //     this.setErrors(validationErrors);
            //     return;
            // }
            this.createTournament(formData);

            this.transitionToRoute('tournaments');
        }
    }
});

