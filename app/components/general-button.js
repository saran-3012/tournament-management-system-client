import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'button',
    classNames: ['button'],
    type: 'button',
    buttonIcon : null,
    buttonName: null,
    attributeBindings: ['type', 'disabled'],
    click(event){
        const handleClick = this.get('onClick');
        if(handleClick){
            handleClick();
        }
    }
});
