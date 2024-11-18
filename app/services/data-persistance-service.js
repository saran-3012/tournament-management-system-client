import Ember from 'ember';

export default Ember.Service.extend({
    data: {},
    setData(key, value, expiryTime){
        const newData = Object.assign({}, this.get('data'), {[key] : value}); 
        this.set('data', newData);
        if(expiryTime){
            setTimeout(() => {
                delete this.data[key];
            }, expiryTime);
        }
    },
    getData(key){
        return this.get('data')[key] || null;
    },
    removeData(key){
        delete this.data[key];
    }
});
