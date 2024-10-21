import Ember from 'ember';

export default Ember.Service.extend({
    data: null,
    setData(_data){
        this.set('data', _data);
    }
});
