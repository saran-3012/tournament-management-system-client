import Ember from 'ember';

export default Ember.Component.extend({

    // Tag Config
    tagName: 'div',
    classNames: ['user-card'],

    // Services
    authenticationService: Ember.inject.service(),
    userInfo: Ember.computed('authenticationService.userInfo', function() {
        return this.get('authenticationService').userInfo;
    }),

    // States
    user: {},
    isMenuOpen: false,
    toggleMenu(event, thisRef){
        const clickEventListener = (event) => {
            if(thisRef.get('isMenuOpen')){
                document.removeEventListener('click', clickEventListener);
                thisRef.set('isMenuOpen', false);
            }
            else{
                setTimeout(() => { 
                    document.addEventListener('click', clickEventListener)
                }, 0);
                thisRef.set('isMenuOpen', true);
            }
        };
        clickEventListener(event);
    },
    actions: {
        handleMenuVisibility(event){
            this.get('toggleMenu')(event, this)
        },
        selectAndOpenEditForm(){
            this.get('setSelectedUser')();
            this.get('setOrganizationUserFormType')(2);
        },
        viewUserDetails(){
            this.get('setSelectedUser')();
            this.get('setOrganizationUserFormType')(3);
        }
    }
});
