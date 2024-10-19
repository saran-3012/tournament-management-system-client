import Ember from 'ember';
import $ from 'jquery';
import HashSet from '../utils/hash-set';
import sanitizeInput from '../utils/sanitize-input';
import dateTimeToMills from '../utils/date-time-to-mills';

export default Ember.Service.extend({
    envService:  Ember.inject.service(),
    userInfo: JSON.parse(sessionStorage.getItem('userInfo')),
    isLoggedIn: sessionStorage.getItem('isLoggedIn') === 'true',

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

        const vulnerableCharacters = new HashSet("<", ">", "&", "'", "\"", "/", "\\", "=", "(", ")", ":", "%", "{", "}", ";");

        orgData['startedYear'] = +formData.get('startedYear');

        for(const key of ['organizationName', 'organizationAddress']){
            orgData[key] = sanitizeInput(formData.get(key), vulnerableCharacters);
        }

        userData['userName'] = sanitizeInput(formData.get('userName'), vulnerableCharacters);
        userData['dateOfBirth'] =  dateTimeToMills(formData.get('dateOfBirth'));
        
        for(const key of ['phoneNumber', 'email', 'password']){
            userData[key] = formData.get(key);
        }

        const config = this.get('envService');
        const apiURL = `${config.getEnv('BASE_API_URL')}/auth/register`;

        $.ajax({
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
        .then((data, textStatus, jqXHR) => {
            thisRef._setUserInfo(data.data, true);
        })
        .catch((jqXHR, textStatus, errorThrown) => {
            console.log(jqXHR, textStatus, errorThrown)
        });
    },

    login(email, password){
        const config = this.get('envService');
        const apiURL = `${config.getEnv('BASE_API_URL')}/auth/login`;

        const thisRef = this;
        $.ajax({
            method: "POST",
            url: apiURL,
            data: JSON.stringify(
                {
                    email, 
                    password
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
        .then((data, textStatus, jqXHR) => {
            thisRef._setUserInfo(data.data, true);
        })
        .catch((jqXHR, textStatus, errorThrown) => {
            console.log(jqXHR, textStatus, errorThrown)
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
        })
    }
});
