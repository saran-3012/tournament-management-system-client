import Ember from 'ember';
import checkCharactersPresent from '../../../utils/check-characters-present';
import formValidator from '../../../utils/form-validator';
import HashSet from '../../../utils/hash-set';
import checkDateValid from '../../../utils/check-date-valid';
import dateTimeToMills from '../../../utils/date-time-to-mills';

export default Ember.Controller.extend({
    
    messageQueueService: Ember.inject.service(),
    envService:  Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    loaderService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function() {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo || {};
    }),

    sportTypeOptions: [
        { value: '', displayName: 'Select sport type', selected: true, disabled: true, hidden: true },
        { value: '0', displayName: 'Individual' },
        { value: '1', displayName: 'Team' }
    ],

    validationConfig: {
        tournamentName: [
            { required: true, message: "Tournament name is required!" },
            { minLength: 3, message: "Tournament name must be atleast 3 characters long" },
            { maxLength: 50, message: "Tournament name must be less than 50 characters" },
            {
                validator(tournamentName){
                    const vulnerableCharacters = new HashSet('<', '>');

                    if(checkCharactersPresent(tournamentName, vulnerableCharacters)){
                        this.message = `${vulnerableCharacters.toString()} are not allowed`;
                        return false;
                    }
                    
                    return true;
                },
                message: 'These characters are not allowed'
            }
        ],
        tournamentdate : [
            { 
                validator(date){
                    if(!date){
                        return true;
                    }

                    return checkDateValid(date);
                }, 
                message: "Provided date is not valid format"
            }
        ],
        tournamentVenue: [
            {
                validator(venue){
                    const vulnerableCharacters = new HashSet('<', '>');

                    if(checkCharactersPresent(venue, vulnerableCharacters)){
                        this.message = `${vulnerableCharacters.toString()} are not allowed`;
                        return false;
                    }
                    
                    return true;
                },
                message: 'Invalid venue'
            }
        ],
        maxParticipation: [
            {
                validator(count){
                    if(isNaN(count)){
                        this.message = "Limit should be number"
                        return false;
                    }
                    count = +count;
                    return count > 0;
                },
                message: "Limit should be atleast 1"
            }
        ],
        registrationStartDate: [
            { required: true, message: "Opening date is required!" },
            { 
                validator(date){
                    if(!date){
                        return false;
                    }

                    return checkDateValid(date);
                }, 
                message: "Provided date is not valid format (dd/mm/yyyy)"
            }
        ],
        registrationEndDate: [
            { required: true, message: "Closing date is required!" },
            { 
                validator(date){
                    if(!date){
                        return false;
                    }
                    return checkDateValid(date);
                }, 
                message: "Provided date is not valid format (dd/mm/yyyy)"
            }
        ],
        sportName: [
            {required: true, message: "Sport name is required"},
            {
                validator(sportName){
                    const vulnerableCharacters = new HashSet('<', '>');

                    if(checkCharactersPresent(sportName, vulnerableCharacters)){
                        this.message = `${vulnerableCharacters.toString()} are not allowed`;
                        return false;
                    }
                    
                    return true;
                },
                message: 'Invalid sport'
            }
        ],
        sportType: [
            {required: true, message: "Sport type is required"},
            {
                validator(type){
                    return (+type === 0 || +type === 1);
                },
                message: 'Sport type can be only individual or team'
            }
        ],
        teamSize: [
            {required: true, message : "Team size is required"},
            {
                validator(size){
                    if(isNaN(size)){
                        this.message = "Team size should be number";
                        return false;
                    }
                    size = +size;
                    return size > 0;
                },
                message: 'Team size should be atleast 1'
            }
        ]
    },
    validationErrors: {},
    setErrors(validationErrors){
        this.set('validationErrors', validationErrors);
    },
    cleanUp(){
        this.setErrors({});
    },

    updateTournament(formData){

        const tournament = this.get('tournament');
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

        const tournamentId = tournament.tournamentId;

        const userInfo = this.get('userInfo');
        const orgId = userInfo.organizationId;
        const config = this.get('envService');
        const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${orgId}/tournaments/${tournamentId}`;

        if(+tournament.registeredCount > 0 || +tournament.teamSize > sportData.teamSize){
                // 
        }
        
        $.ajax({
            method: 'PUT',
            url: apiURL,
            headers: {
                'Tms-Tournament-Update-Option': ''
            },
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
            const authStatus = err.getResponseHeader('Tms-Auth-Status');
            if(authStatus === '1'){
                this.get('authenticationService').logout();
                this.transitionToRoute('index');
            }
        });
    },
    actions: {
        editTournament(event){
            event.preventDefault();

            const formData = new FormData(event.target);
            const [validationErrors, hasErrors] = formValidator(formData, this.get('validationConfig'));
            if(hasErrors){
                this.setErrors(validationErrors);
                return;
            }
            this.updateTournament(formData);

            this.transitionToRoute('tournaments');
        }
    }
});
