import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'aside',
    classNames: ['message-queue'],
    messageQueueService: Ember.inject.service(),
    messageQueue: Ember.computed('messageQueueService.messageQueue', function(){
        return this.get('messageQueueService').messageQueue;
    })
});
