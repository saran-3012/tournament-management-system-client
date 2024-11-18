import Ember from 'ember';
import rsaEncrypter from '../utils/rsa-encrypter';
import checkDateValid from '../utils/check-date-valid';
import HashSet from '../utils/hash-set';
import sanitizeInput from '../utils/sanitize-input';
import dateTimeToMills from '../utils/date-time-to-mills';
import formValidator from '../utils/form-validator';
import checkCharactersPresent from '../utils/check-characters-present';
import passwordValidator from '../utils/password-validator';

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

                    if(!checkDateValid(date)){
                        return false;
                    }

                    if(dateTimeToMills(date) > Date.now()){
                        this.message = "You cannot choose future date";
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
                    const msg = passwordValidator(password);
                    if(msg){
                        this.message = msg;
                        return false;
                    }
                    return true;
                }
                , 
                message: "Entered password is not valid" 
            }, 
        ],
        newPassword: [
            { required: true, message: "New Password is required!" },
            { 
                validator(password){
                    const msg = passwordValidator(password);
                    if(msg){
                        this.message = msg;
                        return false;
                    }
                    return true;
                }
                , 
                message: "Entered New password is not valid" 
            }, 
        ],
        userAddress: [
            {
                validator(uAddress){
                    if(!uAddress) return true;
                    const vulnerableCharacters = new HashSet('<', '>');

                    if(checkCharactersPresent(uAddress, vulnerableCharacters)){
                        this.message = `${vulnerableCharacters.toString()} are not allowed`;
                        return false;
                    }
                    
                    return true;
                },
                message: 'Invalid organization address'
            }
        ],
    },
    validationErrors: {},
    setErrors(validationErrors){
        this.set('validationErrors', validationErrors);
    },
    cleanUp(){
        this.setErrors({});
    },
    genderOptions: [
        { value: 0, displayName: 'Select Gender', selected: true},
        { value: 1, displayName: 'Female' },
        { value: 2, displayName: 'Male' },
    ],
    bloodGroupOptions: [
        { value: '', displayName: 'Select Blood group', selected: true},
        { value: 'A+', displayName: 'A+' },
        { value: 'A-', displayName: 'A-' },
        { value: 'B+', displayName: 'B+' },
        { value: 'B-', displayName: 'B-' },
        { value: 'AB+', displayName: 'AB+' },
        { value: 'AB-', displayName: 'AB-' },
        { value: 'O+', displayName: 'O+' },
        { value: 'O-', displayName: 'O-' }
    ],
    createNewUser(thisRef, formData){

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
    updateExsistingUser(thisRef, formData){

        const authenticationService = thisRef.get('authenticationService');
        const loaderService = thisRef.get('loaderService');
        const messageQueueService = thisRef.get('messageQueueService');
        const config = thisRef.get('envService');

        loaderService.setIsLoading(true);

        const user = thisRef.get('user');

        const userData = {};

        const vulnerableCharacters = new HashSet("<", ">");


        const userName = sanitizeInput(formData.get('userName'), vulnerableCharacters);
        const dateOfBirth =  dateTimeToMills(formData.get('dateOfBirth'));
        const phoneNumber = formData.get('phoneNumber');
        const email = formData.get('email');
        const gender = formData.get('gender');
        const bloodGroup = formData.get('bloodGroup');

        if(userName && user.userName !== userName){
            userData.userName = userName;
        }
        if(dateOfBirth && user.dateOfBirth !== user.dateOfBirth){
            userData.dateOfBirth = dateOfBirth;
        }
        if(phoneNumber && user.phoneNumber !== phoneNumber){
            userData.phoneNumber = phoneNumber;
        }
        if(email && user.email !== email){
            userData.email = email;
        }
        if(gender && user.gender !== gender){
            userData.gender = gender;
        }
        if(bloodGroup && user.bloodGroup !== bloodGroup){
            userData.bloodGroup = bloodGroup;
        }


        const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${user.organizationId}/users/${user.userId}`;

         $.ajax({
            method: 'PUT',
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
        .then((response, textStatus, jqXHR) => {
            if(thisRef.get('editProfileFormOpen')){
                const updatedUserInfo = Object.assign({}, user, response.data);
                authenticationService._setUserInfo(updatedUserInfo, true);
                messageQueueService.addPopupMessage({
                    message: "Profile updated successfully",
                    level: 1
                })
            }
            else{
                thisRef.get('refreshModel')();
                messageQueueService.addPopupMessage({
                    message: "User details updated successfully",
                    level: 1
                })
            }
            thisRef.get('closeOrganizationUserForm')();
        })
        .catch((jqXHR, textStatus, errorThrown) => {
            messageQueueService.addPopupMessage({
                message: jqXHR.responseJSON.message,
                level: 3
            })
        })
        .always(() => {
            loaderService.setIsLoading(false);
        });
    },
    changePassword(thisRef, formData){
        
        const messageQueueService = thisRef.get('messageQueueService');
        const userInfo = thisRef.get('user');
        const config = thisRef.get('envService');

        const oldPassword = formData.get('oldPassword');
        const newPassword = formData.get('newPassword');

        Promise.all([

            rsaEncrypter(oldPassword)
            .then((hashedOldPassword) => {
                return hashedOldPassword;
            })
            .catch((err) => {
                throw new Error("Error in encryption")
            }),

            rsaEncrypter(newPassword)
            .then((hashedNewPassword) => {
                return hashedNewPassword;
            })
            .catch((err) => {
                throw new Error("Error in encryption")
            })

        ])
        .then((response) => {
            const [hashedOldPassword, hashedNewPassword] = response;
            const apiURL = `${config.getEnv('BASE_API_URL')}/auth/change-password`;
            const requestData = {
                oldPassword: hashedOldPassword,
                newPassword: hashedNewPassword
            };

            return $.ajax({
                method: 'POST',
                url: apiURL,
                data: JSON.stringify(requestData),
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
            .catch((err) => {
                throw new Error(err.responseJSON.message);
            });

        })
        .then(() => {
            messageQueueService.addPopupMessage({
                message: "Password Changed Successfully",
                level: 1
            });
            thisRef.get('closeOrganizationUserForm')();
        })
        .catch((err) => {
            messageQueueService.addPopupMessage({
                message: err.message,
                level: 3
            })
        });
    },
    actions: {
        handleOrganizationUserFormSubmit(event){
            event.preventDefault();

            const formData = new FormData(event.target);
            const [validationErrors, hasErrors] = formValidator(formData, this.validationConfig);
            const organizationUserFormType = +this.get('organizationUserFormType');
            const editProfileFormOpen = this.get('editProfileFormOpen');
            const changePasswordFormOpen = this.get('changePasswordFormOpen');
            if(organizationUserFormType === 1 || organizationUserFormType === 2 || editProfileFormOpen){
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
                
                if(organizationUserFormType === 1){
                    this.get('createNewUser')(this, formData);
                }
                else if(organizationUserFormType === 2 || editProfileFormOpen){
                    this.get('updateExsistingUser')(this, formData);
                }
            }
            else if(changePasswordFormOpen){
                const newPassword = formData.get('newPassword');
                const confirmNewPassword = formData.get('confirmNewPassword');

                const isPasswordMatches = (newPassword === confirmNewPassword);
                if(!isPasswordMatches){
                    validationErrors['confirmNewPassword'] = "Confirmation password not matching";
                }
                if(hasErrors || !isPasswordMatches){
                    this.setErrors(validationErrors);
                    return;
                }

                this.get('changePassword')(this, formData);
            }
        }
    }
});
