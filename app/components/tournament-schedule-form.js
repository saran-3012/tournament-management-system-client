import Ember from 'ember';
import checkDateValid from '../utils/check-date-valid';
import HashSet from '../utils/hash-set';
import checkCharactersPresent from '../utils/check-characters-present';
import formValidator from '../utils/form-validator';
import dateTimeToMills from '../utils/date-time-to-mills';

export default Ember.Component.extend({
    // Component details
    tagName: 'section',
    classNames: ['tournament-schedule-form-container'],

    // Services
    messageQueueService: Ember.inject.service(),
    envService: Ember.inject.service(),
    authenticationService: Ember.inject.service(),
    loaderService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function () {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo || {};
    }),
    dataPersistanceService: Ember.inject.service(),
    tournament: Ember.computed('dataPersistanceService.data', function(){
        return this.get('dataPersistanceService').data;
    }),

    // Configs
    init(){
        this._super(...arguments);
        if(this.get('tournamentScheduleFormType') === 2){
            
            const tournament = this.get('tournament');
            const schedule = this.get('selectedSchedule');
            const participationType = (+tournament.sportType === 0)? 'participants' : 'teams';
    
            const dataPersistanceService = this.get('dataPersistanceService');
            const eventContestants = dataPersistanceService.getData(`tournamenteventschedule:${schedule.tournamentEventId},${participationType}`);
            if(eventContestants){
                this.set('eventContestants', eventContestants);
            }
            else{
                this.get('fetchEventContestants')(this);
            }
        }
    },

    tournamentEventRoundOptions: [
        { value: 0, displayName: 'Qualifiers' },
        { value: 1, displayName: 'Play-Off' },
        { value: 2, displayName: 'Quarter-Finals' },
        { value: 3, displayName: 'Semi-Finals' },
        { value: 4, displayName: 'Finals' }
    ],
    validationConfig: {
        tournamentEventDate: [
            { required: true, message: "Event date is required!" },
            {
                validator(date){
                    if(!date){
                        return false;
                    }

                    if(!checkDateValid(date)){
                        return false;
                    }

                    if(dateTimeToMills(date) < Date.now()){
                        this.message = "You cannot choose past date";
                    }

                    return true;
                }, 
                message: "Provided date is not valid format (dd/mm/yyyy)"
            }
        ],
        tournamentEventVenue: [
            { required: true, message: "Event venue is required!" },
            {
                validator(teVenue){
                    const vulnerableCharacters = new HashSet('<', '>');

                    if(checkCharactersPresent(teVenue, vulnerableCharacters)){
                        this.message = `${vulnerableCharacters.toString()} are not allowed`;
                        return false;
                    }
                    
                    return true;
                },
                message: 'Invalid event venue'
            }
        ],
        tournamentEventWinnerId: [
            { required: true, message: "Must choose one winner"}
        ]
    },
    validationErrors: {},
    setErrors(validationErrors){
        this.set('validationErrors', validationErrors);
    },

    // Calls and Actions

    fetchEventContestants(thisRef){

        const userInfo = thisRef.get('userInfo');
        const schedule = thisRef.get('selectedSchedule');
        const tournament = thisRef.get('tournament');
        const config = thisRef.get('envService');
        const apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${userInfo.organizationId}/tournaments/${schedule.tournamentId}/events/${schedule.tournamentEventId}/contestants?exclude_limit=true`;
        const dataPersistanceService = thisRef.get('dataPersistanceService');
        const participationType = (+tournament.sportType === 0)? 'participants' : 'teams';

        $.ajax({
            method: 'GET',
            url: apiURL,
            dataType: "json",
            contentType: "application/json",
            accepts: {
                json: "application/json"
            }
        })
        .then((response, textStatus, jqXHR) => {
            thisRef.set('eventContestants', response.data);
            console.log(`tournamenteventschedule:${schedule.tournamentEventId},${participationType}`)
            dataPersistanceService.setData(`tournamenteventschedule:${schedule.tournamentEventId},${participationType}`, response.data);
            console.log(response.data)
        })
        .catch((err) => {
            thisRef.get('messageQueueService').addPopupMessage({
                message: err.responseJSON.message,
                level: 3
            })
        });
    },


    scheduleEvent(thisRef, formData){

        const messageQueueService = thisRef.get('messageQueueService');

        const tournament = thisRef.get('tournament');
        const userInfo = thisRef.get('userInfo');
        const orgId = userInfo.organizationId;
        const config = thisRef.get('envService');

        let apiURL = `${config.getEnv('BASE_API_URL')}/api/v1/orgs/${orgId}/tournaments/${tournament.tournamentId}/events`;
        const requestData = {};

        requestData.eventData = {
            tournamentEventDate: dateTimeToMills(formData.get('tournamentEventDate')),
            tournamentEventVenue: formData.get('tournamentEventVenue'),
            tournamentEventRound: +formData.get('tournamentEventRound') || 0
        };

        switch(+tournament.sportType){
            case 0:
                const eventParticipantsData = formData.getAll('participantId').map((participantId) => ({participantId: +participantId}));
                requestData.eventParticipantsData = eventParticipantsData;
                break;
            case 1:
                const eventTeamsData = formData.getAll('teamId').map((teamId) => ({teamId: +teamId}));
                requestData.eventTeamsData = eventTeamsData;
                break;
            default:
                messageQueueService.addPopupMessage({
                    message: "Something went wrong",
                    level: 3
                });
                return;
        }


        $.ajax({
            method: 'POST',
            url: apiURL,
            data: JSON.stringify(requestData),
            dataType: "json",
            contentType: "application/json",
            accepts: {
                json: "application/json"
            },
            processData: false,
        })
        .then((data, textStatus, jqXHR) => {
            thisRef.get('refreshModel')();
            messageQueueService.addPopupMessage(
                {
                    message: "Event scheduled successfully",
                    level: 1
                }
            )
        })
        .catch((err) => {
            console.log(err);
            messageQueueService.addPopupMessage(
                {
                    message: err.responseJSON.message,
                    level: 3
                }
            )
        });
    },


    updateEvent(thisRef, formData){

        const dataPersistanceService = thisRef.get('dataPersistanceService');
        const tournament = thisRef.get('tournament');
        const schedule = thisRef.get('selectedSchedule');

        const participationType = (+tournament.sportType === 0)? 'participants' : 'teams';

        const eventContestants = thisRef.get('eventContestants');

        const messageQueueService = thisRef.get('messageQueueService');

        const userInfo = thisRef.get('userInfo');
        const orgId = userInfo.organizationId;
        const config = thisRef.get('envService');
        const baseApiUrl = config.getEnv('BASE_API_URL');

        
        let tournamentEventDate = formData.get('tournamentEventDate');
        tournamentEventDate = (tournamentEventDate)? dateTimeToMills(formData.get('tournamentEventDate')) : undefined;
        const tournamentEventVenue = formData.get('tournamentEventVenue');
        const tournamentEventRound = formData.get('tournamentEventRound');
        const tournamentEventStatus = formData.get('tournamentEventStatus');
        const tournamentEventWinnerId = formData.get('tournamentEventWinnerId');
        
        const updatedEventData = {};

        if(tournamentEventDate && tournamentEventDate !== schedule.tournamentEventDate){
            updatedEventData.tournamentEventDate = tournamentEventDate;
        }
        if(tournamentEventVenue && tournamentEventVenue !== schedule.tournamentEventVenue){
            updatedEventData.tournamentEventVenue = tournamentEventVenue;
        }
        if(tournamentEventRound !== null && !isNaN(tournamentEventRound) && tournamentEventRound !== schedule.tournamentEventRound){
            updatedEventData.tournamentEventRound = +tournamentEventRound;
        }
        if(tournamentEventStatus !== null && !isNaN(tournamentEventStatus) && tournamentEventStatus !== schedule.tournamentEventStatus){
            updatedEventData.tournamentEventStatus = +tournamentEventStatus;
        }
        if(tournamentEventWinnerId !== null && !isNaN(tournamentEventWinnerId) && tournamentEventWinnerId !== schedule.tournamentEventWinnerId){
            updatedEventData.tournamentEventWinnerId = +tournamentEventWinnerId;
        }
        
        const apiCalls = [];
        
        if(Object.keys(updatedEventData).length > 0){
            
            const updateEventApiUrl = `${baseApiUrl}/api/v1/orgs/${orgId}/tournaments/${tournament.tournamentId}/events/${schedule.tournamentEventId}`;
            
            const updateEventApiCall = $.ajax({
                method: 'PUT',
                url: updateEventApiUrl,
                data: JSON.stringify(updatedEventData),
                dataType: "json",
                contentType: "application/json",
                accepts: {
                    json: "application/json"
                },
                processData: false,
            })
            .then((data, textStatus, jqXHR) => {
                
            })
            .catch((err) => {
                
                throw new Error(err.responseJSON.message);
            });
    
            apiCalls.push(updateEventApiCall);

        }



        switch(+tournament.sportType){
            case 0:
                const eventParticipantsData = formData.getAll('participantId');
                if(eventParticipantsData.length > 0){
                    const newParticipantsData = [];
    
                    for(const pId of eventParticipantsData){
                        let isPresent = false;
                        for(const participant of eventContestants){
                            if(participant.participantId === +pId){
                                isPresent = true;
                                break;
                            }
                        }
                        if(!isPresent){
                            newParticipantsData.push({participantId: pId});
                        }
                    }
    
                    if(newParticipantsData.length > 0){
                        const newParticipantsApiUrl = `${baseApiUrl}/api/v1/orgs/${orgId}/tournaments/${tournament.tournamentId}/events/${schedule.tournamentEventId}/participants`;
                        const newParticipantsApiCall = $.ajax({
                            method: 'POST',
                            url: newParticipantsApiUrl,
                            data: JSON.stringify({tournamentEventParticipants : newParticipantsData}),
                            dataType: "json",
                            contentType: "application/json",
                            accepts: {
                                json: "application/json"
                            },
                            processData: false,
                        })
                        .then(() => {
                            dataPersistanceService.removeData(`tournamenteventschedule:${schedule.tournamentEventId},${participationType}`)
                        })
                        .catch((err) => {
                            throw new Error(err.responseJSON.message);
                        });
    
                        apiCalls.push(newParticipantsApiCall);
                    }
    
                    const removedParticipantsData = [];
                    const eventParticipantsSet = new HashSet(...eventParticipantsData);
                    for(const participant of eventContestants){
                        if(!eventParticipantsSet.contains(participant.participantId)){
                            removedParticipantsData.push(participant.participantId);
                        }
                    }
    
                    if(removedParticipantsData.length > 0){
                        const removedParticipantIds = removedParticipantsData.join(',');
                        const removedParticipantsApiUrl = `${baseApiUrl}/api/v1/orgs/${orgId}/tournaments/${tournament.tournamentId}/events/${schedule.tournamentEventId}/participants/${removedParticipantIds}`
                        const removeParticipantsApiCall = $.ajax({
                            method: 'DELETE',
                            url: removedParticipantsApiUrl,
                            dataType: "json",
                            contentType: "application/json",
                            accepts: {
                                json: "application/json"
                            },
                            processData: false,
                        })
                        .then(() => {
                            dataPersistanceService.removeData(`tournamenteventschedule:${schedule.tournamentEventId},${participationType}`)
                        })
                        .catch((err) => {
                            throw new Error(err.responseJSON.message);
                        });
    
                        apiCalls.push(removeParticipantsApiCall);
                    }
                }

                break;
            case 1:
                const eventTeamsData = formData.getAll('teamId');
                if(eventTeamsData.length > 0){
                    const newTeamsData = []; 
    
                    for(const tId of eventTeamsData){
                        let isPresent = false;
                        for(const team of eventContestants){
                            if(team.teamId === +tId){
                                isPresent = true;
                                break;
                            }
                        }
                        if(!isPresent){
                            newTeamsData.push({teamId: tId});
                        }
                    }
    
                    if(newTeamsData.length > 0){
                        const newTeamsApiUrl = `${baseApiUrl}/api/v1/orgs/${orgId}/tournaments/${tournament.tournamentId}/events/${schedule.tournamentEventId}/teams`;
                        const newTeamsApiCall = $.ajax({
                            method: 'POST',
                            url: newTeamsApiUrl,
                            data: JSON.stringify({tournamentEventTeams : newTeamsData}),
                            dataType: "json",
                            contentType: "application/json",
                            accepts: {
                                json: "application/json"
                            },
                            processData: false,
                        })
                        .then(() => {
                            dataPersistanceService.removeData(`tournamenteventschedule:${schedule.tournamentEventId},${participationType}`)
                        })
                        .catch((err) => {
                            throw new Error(err.responseJSON.message);
                        });
    
                        apiCalls.push(newTeamsApiCall);
                    }
    
                    const removedTeamsData = [];
                    const eventTeamsSet = new HashSet(...eventTeamsData);
                    for(const team of eventContestants){
                        if(!eventTeamsSet.contains(team.teamId)){
                            removedTeamsData.push(team.teamId);
                        }
                    }
                    
                    if(removedTeamsData.length > 0){
                        const removedTeamIds = removedTeamsData.join(',');
                        const removedTeamsApiUrl = `${baseApiUrl}/api/v1/orgs/${orgId}/tournaments/${tournament.tournamentId}/events/${schedule.tournamentEventId}/teams/${removedTeamIds}`
                        const removeTeamsApiCall = $.ajax({
                            method: 'DELETE',
                            url: removedTeamsApiUrl,
                            dataType: "json",
                            contentType: "application/json",
                            accepts: {
                                json: "application/json"
                            },
                            processData: false,
                        })
                        .then(() => {
                            dataPersistanceService.removeData(`tournamenteventschedule:${schedule.tournamentEventId},${participationType}`)
                        })
                        .catch((err) => {
                            throw new Error(err.responseJSON.message);
                        });
    
                        apiCalls.push(removeTeamsApiCall);
                    }
                }
                
                break;
            default:
                messageQueueService.addPopupMessage({
                    message: "Something went wrong",
                    level: 3
                });
                return;
        }

        Promise.all(apiCalls)
               .then(() => {
                    thisRef.get('refreshModel')();
                    messageQueueService.addPopupMessage(
                        {
                            message: "Event updated successfully",
                            level: 1
                        }
                    )
               })
               .catch((err) => {
                    messageQueueService.addPopupMessage(
                        {
                            message: err.responseJSON.message,
                            level: 3
                        }
                    )
               });


       
    },
    submit(event){
        event.preventDefault();

        const tournamentScheduleFormType = +this.get('tournamentScheduleFormType');

        const formData = new FormData(event.target);


        if(tournamentScheduleFormType === 1 || tournamentScheduleFormType === 2){
            const [validationErrors, hasErrors] = formValidator(formData, this.get('validationConfig'));
            
            const tournament = this.get('tournament');
            const participantIdType = (+tournament.sportType === 0)? 'participantId' : 'teamId';
            const selectedContestants = formData.getAll(participantIdType);
            const isMinimumContestantSelected = selectedContestants.length > 1;
            if(!isMinimumContestantSelected){
                validationErrors[participantIdType] = `Atleast select 2 ${(+tournament.sportType === 0)? 'participants' : 'teams'}`
            }
     
            if(hasErrors || !isMinimumContestantSelected){
                this.setErrors(validationErrors);
                return;
            }
        }

        switch(tournamentScheduleFormType){
            case 1:
                this.get('scheduleEvent')(this, formData);
                break;
            case 2:
                this.get('updateEvent')(this, formData);
                break;
            case 3:
                const customFormData = new FormData();
                customFormData.append('tournamentEventStatus', (+this.get('selectedSchedule').tournamentEventStatus === 2)? '0' : '2');
                this.get('updateEvent')(this, customFormData);
                break;
            case 4:
                formData.set('tournamentEventStatus', '1');
                this.get('updateEvent')(this, formData);
                break;
            default:
                this.get('messageQueueService').addPopupMessage({
                    message: "Invalid operation",
                    level: 2
                })
        }
        this.get('closeTournamentScheduleForm')();
    },
});
