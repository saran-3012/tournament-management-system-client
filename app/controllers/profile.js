import Ember from 'ember';

export default Ember.Controller.extend({

    editProfileFormOpen: false,
    changePasswordFormOpen: false,

    actions: {
        refreshModel(){
             
        },
        goBack(){
            history.back();
        },
        setEditProfileFromOpen(value){
            if(value){
                this.set('changePasswordFormOpen', false);
            }
            this.set('editProfileFormOpen', !!value);
        },
        setChangePasswordFormOpen(value){
            if(value){
                this.set('editProfileFormOpen', false);
            }
            this.set('changePasswordFormOpen', !!value);
        }
    }
});
