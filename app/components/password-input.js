import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['input'],
    attributeBindings: ['name', 'disabled'],
    isRequired: false,
    isPasswordVisible: false,
    inputName: null,
    inputId: null,
    lableName: null,
    inputPlaceholder: '',
    errorMessage: null,
    actions: {
        togglePasswordVisibility(){
            this.toggleProperty('isPasswordVisible');
        },
        handleInputChange(){
            this.set('errorMessage', null);
        }
    }
});
