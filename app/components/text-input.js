import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['input'],
    inputName: null,
    inputId: null,
    lableName: null,
    isRequired: false,
    inputPlaceholder: '',
    errorMessage: null,
    actions: {
        handleInputChange(){
            this.set('errorMessage', null);
        }
    }
});
