import Ember from 'ember';
import limitCalls from '../utils/limit-calls';

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['search-bar'],
    isFocused: false,
    searchField: '',
    init() {
        this._super(...arguments);
        this.set('limitedSearchCall', limitCalls(
            this.get('minWait'),
            this.get('searchHandler')
        ));
    },
    searchData: Ember.observer('searchField', function () {
        this.get('limitedSearchCall')(this.get('searchField'));
    })
});
