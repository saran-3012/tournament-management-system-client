import Ember from 'ember';
import ControllableTimeout from '../utils/controllable-timeout';

export default Ember.Service.extend({
    messageQueue: [],
    
    addPopupMessage(messageInfo){
        messageInfo.timeout = messageInfo.timeout || 4000;
        messageInfo.id = Date.now();
        this.set('messageQueue', [...this.get('messageQueue'), messageInfo]);
        const thisRef = this;
        const messageTimeoutController = new ControllableTimeout(() => {
            const updatedMessageQueue = thisRef.get('messageQueue').filter((msgInfo) => messageInfo.id !== msgInfo.id);
            thisRef.set('messageQueue', updatedMessageQueue);
        }, messageInfo.timeout);
        messageInfo.timeoutController = messageTimeoutController;
        messageTimeoutController.start();
    }

    /*
        Message info model

        message : 'User died successfully' (string)

        type: 1
                (   
                    * 0 -> (info , blue)
                    * 1 -> (success, green)
                    * 2 -> (warning, orange)
                    * 3 -> (error, red)
                )

        timeout: 3000 (millis)

    */
});
