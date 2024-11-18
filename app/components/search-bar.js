import Ember from 'ember';
import delayCalls from '../utils/delay-calls';

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['search-bar'],
    isFocused: false,
    searchValue: '',
    init() {
        this._super(...arguments);
        this.set('delayedSearchCall', delayCalls(
            this.get('minWait'),
            this.get('searchHandler')
        ));
    },

    input(event){
        this.set('searchValue', event.target.value);

        const delayedSearchCall = this.get('delayedSearchCall');
        const searchValue = this.get('searchValue');
        const objectKey = this.get('objectKey');

        (objectKey)? delayedSearchCall({[objectKey]: searchValue}) : delayedSearchCall(searchValue);
    }
});
