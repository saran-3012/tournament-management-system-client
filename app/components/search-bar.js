import Ember from 'ember';
import delayCalls from '../utils/delay-calls';

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['search-bar'],
    isFocused: false,
    searchField: '',
    init() {
        this._super(...arguments);
        this.set('delayedSearchCall', delayCalls(
            this.get('minWait'),
            this.get('searchHandler')
        ));
    },
    searchData: Ember.observer('searchField', function () {
        this.get('delayedSearchCall')(this.get('searchField'));
    })
});
