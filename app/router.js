import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function () {
  this.route('login');
  this.route('register');
  this.route('dashboard');
  this.route('tournaments', function() {
    this.route('tournament', { path : ':tournament_id' }, function() {
      this.route('edit');
    });
    this.route('new');
  });
  this.route('organizations', function() {
    this.route('organization', {
      path: ':organization_id'
    });
  });
  this.route('access-denied');





  this.route('not-found', {path: '/*'});
});

export default Router;