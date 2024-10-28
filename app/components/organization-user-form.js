import Ember from 'ember';
import rsaEncrypter from '../utils/rsa-encrypter';
import getMonthDaysCount from '../utils/get-month-days-count';
import HashSet from '../utils/hash-set';
import sanitizeInput from '../utils/sanitize-input';
import dateTimeToMills from '../utils/date-time-to-mills';
import formValidator from '../utils/form-validator';

export default Ember.Component.extend({
    envService: Ember.inject.service(),
    messageQueueService: Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    loaderService: Ember.inject.service(),
    tagName: null,
    orgUserFormType: 0,
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
        ]
    },
    validationErrors: {},
    setErrors(validationErrors){
        this.set('validationErrors', validationErrors);
    },
    cleanUp(){
        this.setErrors({});
    },
    createNewUser(thisRef, formData){

        console.log(thisRef)
        console.log(thisRef.get('closeOrganizationUserForm'));
        console.log(thisRef.get('refreshModel'))

        const loaderService = thisRef.get('loaderService');
        const messageQueueService = thisRef.get('messageQueueService');
        const config = thisRef.get('envService');

        loaderService.setIsLoading(true);


        const organization = thisRef.get('organization');

        const userData = {};

        const vulnerableCharacters = new HashSet("<", ">");

        userData['userName'] = sanitizeInput(formData.get('userName'), vulnerableCharacters);
        userData['dateOfBirth'] =  dateTimeToMills(formData.get('dateOfBirth'));
        
        for(const key of ['phoneNumber', 'email']){
            userData[key] = formData.get(key);
        }

        const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${organization.organizationId}/users`;
        const password = formData.get('password');

        rsaEncrypter(password)
        .then((encryptedPassword) => {

            userData['password'] = encryptedPassword;

            return $.ajax({
                method: 'POST',
                url: apiURL,
                data: JSON.stringify(userData),
                dataType: "json",
                contentType: "application/json",
                accepts: {
                    json: "application/json"
                },
                processData: false,
                headers: {
                    'Cache-Control': 'no-cache',  
                    'Pragma': 'no-cache',        
                },
                cache: false
            })
        })
        .then((data, textStatus, jqXHR) => {
            thisRef.get('refreshModel')();
            messageQueueService.addPopupMessage({
                message: "User added successfully",
                level: 1
            })
            thisRef.get('closeOrganizationUserForm')();
        })
        .catch((jqXHR, textStatus, errorThrown) => {
            console.log(jqXHR, textStatus, errorThrown)
            messageQueueService.addPopupMessage({
                message: jqXHR.responseJson.message,
                level: 3
            })
        })
        .finally(() => {
            loaderService.setIsLoading(false);
        });

    },
    updateExsistingUser(formData){

    },
    actions: {
        handleOrganizationUserFormSubmit(event){
            event.preventDefault();

            const formData = new FormData(event.target);
            const [validationErrors, hasErrors] = formValidator(formData, this.validationConfig);
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
            
            const organizationUserFormType = this.get('organizationUserFormType');
            if(organizationUserFormType === 1){
                this.get('createNewUser')(this, formData);
            }
            else if(organizationUserFormType === 2){

            }
        }
    }
});
