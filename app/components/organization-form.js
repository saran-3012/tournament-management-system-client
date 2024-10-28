import Ember from 'ember';
import formValidator from '../utils/form-validator';
import HashSet from '../utils/hash-set';
import checkCharactersPresent from '../utils/check-characters-present';

export default Ember.Component.extend({
    tagName: null,
    validationConfig: {
        organizationName: [
            { required: true, message: "Organization Name is required!" },
            {
                validator(orgName){
                    const vulnerableCharacters = new HashSet('<', '>');

                    if(checkCharactersPresent(orgName, vulnerableCharacters)){
                        this.message = `${vulnerableCharacters.toString()} are not allowed`;
                        return false;
                    }
                    
                    return true;
                },
                message: 'Invalid organization name'
            }
        ],
        organizationAddress: [
            { required: true, message: "Organization address is required!" },
            {
                validator(orgName){
                    const vulnerableCharacters = new HashSet('<', '>');

                    if(checkCharactersPresent(orgName, vulnerableCharacters)){
                        this.message = `${vulnerableCharacters.toString()} are not allowed`;
                        return false;
                    }
                    
                    return true;
                },
                message: 'Invalid organization address'
            }
        ],
        startedYear: [
            { required: true, message: "Started year is required!" },
            {
                validator(year){
                    if(isNaN(year)){
                        return false;
                    }
                    year = +year;
                    if(!year || year > new Date().getFullYear()){
                        return false;
                    }
                    return true;
                },
                message: "Started year is not valid"
            }
        ]
    },
    validationErrors: {},
    setErrors(validationErrors){
        this.set('validationErrors', validationErrors);
    },
    willDestroyElement() {
        this._super(...arguments);
        this.setErrors({});
    },
    actions: {
        handleSubmit(event){
            event.preventDefault();
            const formData = new FormData(event.target);
            const [validationErrors, hasErrors] = formValidator(formData, this.validationConfig);
            if(hasErrors){
                this.setErrors(validationErrors);
                return;
            }
            this.get('handleOrganizationUpdate')(formData);
            this.get('closeOrganizationForm')();
        }
    }
});
