import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['input'],
    attributeBindings: ['disabled'],
    inputName: null,
    inputId: null,
    lableName: null,
    isRequired: false,
    selectedValue: '',
    defaultValue: '',
    options: [],
    errorMessage: null,

    init(){
        this._super(...arguments);
        const defaultValue = this.get('defaultValue');
        const selectedValue = this.get('selectedValue');

        if(defaultValue || selectedValue){
            const options = this.get('options');
            const updatedOptions = options.map((option) => {
                option.selected = (option.displayName === defaultValue) || (option.value === selectedValue);
                return option;
            });
            this.set('options', updatedOptions);
        }
    },
    change(event){
        this.set('selectedValue', event.target.value);
        this.set('errorMessage', null);
        const handleChange = this.get('onChange');
        if(handleChange !== null && typeof handleChange === 'function' ){
            const objectKey = this.get('objectKey');
            const selectedValue = this.get('selectedValue');
            (objectKey)? handleChange({[objectKey] : selectedValue}) : handleChange(selectedValue);
        }
    },
    actions: {
       
    }
});
