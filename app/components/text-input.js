import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['input'],
    attributeBindings: ['disabled'],
    inputName: null,
    inputId: null,
    lableName: null,
    isRequired: false,
    inputPlaceholder: '',
    defaultValue: '',
    errorMessage: null,
    actions: {
        handleInputChange(){
            this.set('errorMessage', null);
        }
    }
});
