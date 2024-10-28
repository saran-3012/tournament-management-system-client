import Ember from 'ember';
import formValidator from '../utils/form-validator';
import getMonthDaysCount from '../utils/get-month-days-count';
import HashSet from '../utils/hash-set';
import checkCharactersPresent from '../utils/check-characters-present';

export default Ember.Controller.extend({
    authenticationService : Ember.inject.service(),
    validationConfig: {
        userName: [
            { required: true, message: "User name is required!" },
            { minLength: 3, message: "User name must be atleast 3 characters long" },
            { maxLength: 30, message: "User name must be less than 30 characters" }
        ],
        dateOfBirth : [
            {required: true, message: "Date of birth is required"},
            { 
                validator(date){
                    if(!date){
                        return false;
                    }

                    const [day, month, year] = date.split("/").map(Number);
                    
                    if(!month || month < 1 || month > 12){
                        return false;
                    }

                    if(!day || day < 1 || day > getMonthDaysCount(month, year)){
                        return false;
                    }

                    if(!year || year > new Date().getFullYear()){
                        return false;
                    }

                    return true;
                }, 
                message: "Provided date is not valid format"
            }
        ],
        phoneNumber: [
            { required: true, message: "Phone number is required!" },
            {
                validator(phoneNumber){
                    console.log(phoneNumber)
                    if(!phoneNumber){
                        return false;
                    }
                    phoneNumber = phoneNumber.trim();
                    for(const digit of phoneNumber){
                        if(isNaN(digit) || digit === ' '){
                            this.message = 'Phone number should only contain digits';
                            return false;
                        }
                    }
                    if(phoneNumber.length !== 10){
                        debugger;
                        this.message = 'Must only contain 10 digits (Only for india)'
                        return false;
                    }
                    return true;
                },
                message: 'Phone number is not valid'
            }
        ],
        email: [
            { required: true, message: "Email is required!" },
            { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i, message: "Entered email is not valid" }
        ],
        password: [
            { required: true, message: "Password is required!" },
            { 
                validator(password){
                    if(!password){
                        return false;
                    }
                    let lwrCse = 0;
                    let uprCse = 0;
                    let digits = 0;
                    let splchs = 0;
                    if(password.length < 8){
                        this.message = "Password must be atleast 8 character long";
                        return false;
                    }
                    for(let ch of password){
                        if(ch >= 'a' && ch <= 'z'){
                            lwrCse++;
                        }
                        else if(ch >= 'A' && ch <= 'Z'){
                            uprCse++;
                        }
                        else if(ch >= '0' && ch <= '9'){
                            digits++;
                        }
                        else{
                            splchs++;
                        }
                    }
                    if(!lwrCse){
                        this.message = "Password must contain atleast one lower case character"
                        return false;
                    }
                    if(!uprCse){
                        this.message = "Password must contain atleast one upper case character"
                        return false;
                    }
                    if(!digits){
                        this.message = "Password must contain atleast one digit"
                        return false;
                    }
                    if(!splchs){
                        this.message = "Password must contain atleast one special character"
                        return false;
                    }
                    return true;
                }
                , 
                message: "Entered password is not valid" 
            }
        ],
        organizationName: [
            { required: true, message: "Organization name is required!" },
            { maxLength: 50, message: "Organization Name must be less than 50 characters" },
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
    cleanUp(){
        this.setErrors({});
    },
    actions: {

        handleSubmit(event){
            event.preventDefault();

            const formData = new FormData(event.target);
            const [validationErrors, hasErrors] = formValidator(formData, this.get('validationConfig'));
            formData.set('email', formData.get('email').toLowerCase());
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');
            const isPasswordMatches = (password === confirmPassword);
            if(!isPasswordMatches){
                validationErrors['confirmPassword'] = "Confirmation password not matching";
            }
            if(hasErrors || !isPasswordMatches){
                this.setErrors(validationErrors);
                return;
            }
            this.get('authenticationService').register(formData);

            this.transitionToRoute('login');
        }
    }
});
