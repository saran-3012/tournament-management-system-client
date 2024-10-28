import Ember from 'ember';
import checkCharactersPresent from '../utils/check-characters-present';
import formValidator from '../utils/form-validator';
import HashSet from '../utils/hash-set';

export default Ember.Component.extend({
    tagName: 'section',
    classNames: ['tournament-participation-form-container'],
    teamRegistrationType: 0,
    validationConfig: {
        teamName: [
            { required: true, message: "Team Name is required!" },
            {
                validator(tName){
                    const vulnerableCharacters = new HashSet('<', '>');

                    if(checkCharactersPresent(tName, vulnerableCharacters)){
                        this.message = `${vulnerableCharacters.toString()} are not allowed`;
                        return false;
                    }
                    
                    return true;
                },
                message: 'Invalid team name'
            }
        ],
        teamId: [
            { required: true, message: "Team id is required!" },
            {
                validator(tId){
                    console.log("team id", tId)
                    return !isNaN(tId);
                },
                message: 'Team id should be number'
            }
        ]
    },
    validationErrors: {},
    setErrors(validationErrors){
        this.set('validationErrors', validationErrors);
    },
    submit(event){
        event.preventDefault();

        const teamRegistrationType = this.get('teamRegistrationType');

        const formData = new FormData(event.target);
        const [validationErrors, hasErrors] = formValidator(formData, this.get('validationConfig'));
        let isTeamIdNull = false;
        if(teamRegistrationType === 1 && !formData.get('teamId')){
            validationErrors['teamId'] = 'Select a team!';
            isTeamIdNull = true;
        }
        if(hasErrors || isTeamIdNull){
            this.setErrors(validationErrors);
            return;
        }

        this.get('onConfirmation')({teamRegistrationType, formData});
        this.get('closeTournamentForm')();
    },
    willDestroyElement() {
        this._super(...arguments);
        this.setErrors({});
    },
    actions: {
        setTeamRegistrationType(value){
            const teamRegistrationType = this.get('teamRegistrationType');
            this.set('teamRegistrationType', (teamRegistrationType === value)? 0 : value);
        }
    },
});
