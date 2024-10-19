import Ember from 'ember';

export default Ember.Component.extend({
    tagName: null,
    messageColor: Ember.computed('messageInfo.level', function(){
        switch(this.get('messageInfo.level')){
            case 0:
                return 'blue';
            case 1: 
                return 'green';
            case 2:
                return 'orange';
            case 3:
                return 'red';
            default:
                return 'grey';
        }
    }),
    actions: {
        pauseTimer(){
            const messageInfo = this.get('messageInfo');
            messageInfo.timeoutController.pause();
        },
        resumeTimer(){
            const messageInfo = this.get('messageInfo');
            messageInfo.timeoutController.resume();
        },
        clearTimer(){
            const messageInfo = this.get('messageInfo');
            messageInfo.timeoutController.clear();
        }
    }
});
