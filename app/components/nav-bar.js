import Ember from 'ember';

export default Ember.Component.extend({
    // Component config
    tagName: 'header',
    classNames: ['container', 'navbar'],

    // Services
    authenticationService: Ember.inject.service(),
    router: Ember.computed(function() {
        return Ember.getOwner(this).lookup('router:main');
    }),
    isLoggedIn: Ember.computed.readOnly('authenticationService.isLoggedIn'),
    userName: Ember.computed('authenticationService.userInfo', function() {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo.userName.split(' ')[0] || 'User';
    }),
    userRole: Ember.computed('authenticationService.userInfo', function() {
        const userInfo = this.get('authenticationService').userInfo;
        return userInfo.role || 0;
    }),
    userInfo: Ember.computed('authenticationService.userInfo', function() {
        return this.get('authenticationService').userInfo;
    }),

    // State config
    isProfileMenuOpen: false,
    toggleProfileMenu(event, thisRef){
        const clickEventListener = (event) => {
            if(thisRef.get('isProfileMenuOpen')){
                document.removeEventListener('click', clickEventListener);
                thisRef.set('isProfileMenuOpen', false);
            }
            else{
                setTimeout(() => { 
                    document.addEventListener('click', clickEventListener)
                }, 0);
                thisRef.set('isProfileMenuOpen', true);
            }
        };
        clickEventListener(event);
    },

    // actions
    actions: {
        handleProfileMenuVisibility(event){
            this.get('toggleProfileMenu')(event, this);
        },
        logout(){
            const router = this.get('router');
            this.get('authenticationService').logout(() => router.transitionTo('index'));
        }
    }
});
