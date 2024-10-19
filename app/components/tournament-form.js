import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'section',
    classNames: ['tournament-form-container'],
    teamRegistrationType: 0,
    submit(event){
        const teamRegistrationType = this.get('teamRegistrationType');
        this.get('onConfirmation')({event, teamRegistrationType});
        this.get('closeTournamentForm')();
    },
    actions: {
        setTeamRegistrationType(value){
            const teamRegistrationType = this.get('teamRegistrationType');
            this.set('teamRegistrationType', (teamRegistrationType === value)? 0 : value);
        }
    }
});
