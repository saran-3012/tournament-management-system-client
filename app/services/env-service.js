import Ember from 'ember';

export default Ember.Service.extend({
    _config: {
        BASE_API_URL: '/tms'
    },
    getEnv(variableName) {
        return this.get('_config')[variableName];
    }
});