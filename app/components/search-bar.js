import Ember from 'ember';
import limitCalls from '../utils/limit-calls';

export default Ember.Component.extend({
    tagName: 'div',
    classNames: ['search-bar'],
    isFocused : false,
    searchField: '',
    actions: {
        setIsFocused(value){
            this.set('isFocused', value);
        },
        handleSearchInput(event) {
            // this.get('searchCall')(this.get('searchField'));
        }
    }
});
