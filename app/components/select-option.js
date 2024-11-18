import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'option',
    classNames: ['option'],
    attributeBindings: ['selected', 'disabled', 'hidden', 'value'],
    
    init(){

        this._super(...arguments);
        const option = this.get('option');

        const {selected, disabled, hidden, value, displayName} = option;

        if(selected === true || selected === 'true'){
            this.set('selected', true);
        }

        if(disabled === true || disabled === 'true'){
            this.set('disabled', true);
        }

        if(hidden === true || hidden === 'true'){
            this.set('hidden', true);
        }

        this.set('value', value || '');
        this.set('displayName', displayName || 'Choose here');

    }
});
