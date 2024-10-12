import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['input'],
    attributeBindings: ['name'],
    isRequired: false,
    isPasswordVisible: false,
    actions: {
        togglePassword(){
            this.toggleProperty('isPasswordVisible');
        }
    }
});
