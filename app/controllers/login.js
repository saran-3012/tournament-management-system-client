import Ember from 'ember';
import formValidator from '../utils/form-validator';

export default Ember.Controller.extend({
    authenticationService : Ember.inject.service(),
    validationConfig: {
        email: [
            { required: true, message: "Email is required!" },
            { pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g, message: "Entered email is not valid" }
        ],
        password: [
            { required: true, message: "Password is required!" }
        ]
    },
    validationErrors: {},
    setErrors(validationErrors){
        this.set('validationErrors', validationErrors);
    },
    cleanUp(){
        this.setErrors({});
    },
    actions: {
        handleSubmit(event){
            event.preventDefault();

            const formData = new FormData(event.target);
            const [validationErrors, hasErrors] = formValidator(formData, this.get('validationConfig'));
            if(hasErrors){
                this.setErrors(validationErrors);
                return;
            }
            this.get('authenticationService').login(formData.get('email').toLowerCase(), formData.get('password'));

            this.transitionToRoute('index');
        }
    }
});
