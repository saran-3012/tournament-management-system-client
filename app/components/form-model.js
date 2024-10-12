import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['form-model'],
    formHeader: null,
    submit(e) {
        this.get('onSubmit')(e);
    }
});
