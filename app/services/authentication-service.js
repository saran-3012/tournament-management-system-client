import Ember from 'ember';
import $ from 'jquery';
import HashSet from '../utils/hash-set';
import sanitizeInput from '../utils/sanitize-input';
import dateTimeToMills from '../utils/date-time-to-mills';
import rsaEncrypter from '../utils/rsa-encrypter';

export default Ember.Service.extend({
    envService:  Ember.inject.service(),
    userInfo: JSON.parse(sessionStorage.getItem('userInfo')),
    isLoggedIn: sessionStorage.getItem('isLoggedIn') === 'true',
    messageQueueService: Ember.inject.service(),

    _setUserInfo(userInfo, isLoggedIn){
        this.set("userInfo", userInfo);
        this.set("isLoggedIn", isLoggedIn);
        sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
        sessionStorage.setItem('isLoggedIn', '' + isLoggedIn);
    },

    register(formData){
        const thisRef = this;

        const orgData = {};
        const userData = {};

        const vulnerableCharacters = new HashSet("<", ">");

        orgData['startedYear'] = +formData.get('startedYear');

        for(const key of ['organizationName', 'organizationAddress']){
            orgData[key] = sanitizeInput(formData.get(key), vulnerableCharacters);
        }

        userData['userName'] = sanitizeInput(formData.get('userName'), vulnerableCharacters);
        userData['dateOfBirth'] =  dateTimeToMills(formData.get('dateOfBirth'));
        
        for(const key of ['phoneNumber', 'email']){
            userData[key] = formData.get(key);
        }

        const password = formData.get('password');

        rsaEncrypter(password)
        .then((encryptedPassword) => {
            
            userData['password'] = encryptedPassword;

            const config = this.get('envService');
            const apiURL = `${config.getEnv('BASE_API_URL')}/auth/register`;

            return $.ajax({
                method: "POST",
                url: apiURL,
                data: JSON.stringify({orgData, userData}),
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
            thisRef._setUserInfo(data.data, true);
        })
        .catch((jqXHR, textStatus, errorThrown) => {
            console.log(jqXHR, textStatus, errorThrown)
            this.get('messageQueueService').addPopupMessage({
                message: jqXHR.responseJson.message,
                level: 3
            })
        });
    },

    login(email, password, callBack){
        const messageQueueService = this.get('messageQueueService');
        const thisRef = this;

        rsaEncrypter(password)
        .then((encryptedPassword) => {
            const config = this.get('envService');
            const apiURL = `${config.getEnv('BASE_API_URL')}/auth/login`;

            return $.ajax({
                method: "POST",
                url: apiURL,
                data: JSON.stringify(
                    {
                        email, 
                        password : encryptedPassword
                    }
                ),
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
            thisRef._setUserInfo(data.data, true);
            callBack();
        })
        .catch((jqXHR, textStatus, errorThrown) => {
            console.log(jqXHR, textStatus, errorThrown)
            messageQueueService.addPopupMessage({
                message: "Invalid user credentials",
                level: 3
            })
        });
       
    },

    checkin(callBack){

        const config = this.get('envService');
        const apiURL = `${config.getEnv('BASE_API_URL')}/auth/checkin`;

        const thisRef = this;
        return $.ajax({
            method: "POST",
            url: apiURL,
            dataType: "json",
            contentType: "application/json",
            accepts: {
                json: "application/json"
            },
            headers: {
                'Cache-Control': 'no-cache,no-store,max-age=0,must-revalidate',  
                'Pragma': 'no-cache',        
            },
            cache: false
        })
        .then((data, textStatus, jqXHR) => {
            thisRef._setUserInfo(data.data, true);
            callBack();
        })
        .catch((jqXHR, textStatus, errorThrown) => {
            console.log(jqXHR, textStatus, errorThrown)
            
            this.get('messageQueueService').addPopupMessage({
                message: jqXHR.responseJson.message,
                level: 0
            });
        });

    },

    logout(){

        const config = this.get('envService');
        const apiURL = `${config.getEnv('BASE_API_URL')}/auth/logout`;

        const thisRef = this;
        $.ajax({
            method: "POST",
            url: apiURL,
            accepts: {
                json: "application/json"
            },
            headers: {
                'Cache-Control': 'no-cache',  
                'Pragma': 'no-cache',        
            },
            cache: false
        })
        .then((data, textStatus, jqXHR) => {
            thisRef._setUserInfo(null, false);
            sessionStorage.clear();
        })
        .catch((jqXHR, textStatus, errorThrown) => {
            console.log(jqXHR, textStatus, errorThrown)
            messageQueueService.addPopupMessage({
                message: jqXHR.responseJson.message,
                level: 3
            })
        })
    }
});
