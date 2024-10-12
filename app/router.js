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
    this.route('tournament', { path : '/:tournament_id' });
  });
  this.route('organizations');
});

export default Router;