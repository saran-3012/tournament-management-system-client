import Ember from 'ember';

export default Ember.Service.extend({
    isLoading : false,
    setIsLoading(value){
        this.set('isLoading', value);
    }
});
