import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['icon-label-item'],
    attributeBindings: ['title']
});
