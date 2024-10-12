import Ember from 'ember';

export default Ember.Service.extend({
    _config: {
        BASE_API_URL: 'http://localhost:8080/tms'
    },
    getEnv(variableName) {
        return this.get('_config')[variableName];
    }
});
