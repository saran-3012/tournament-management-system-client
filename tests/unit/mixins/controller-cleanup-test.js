import Ember from 'ember';
import ControllerCleanupMixin from 'tournament-management-system/mixins/controller-cleanup';
import { module, test } from 'qunit';

module('Unit | Mixin | controller cleanup');

// Replace this with your real tests.
test('it works', function(assert) {
  let ControllerCleanupObject = Ember.Object.extend(ControllerCleanupMixin);
  let subject = ControllerCleanupObject.create();
  assert.ok(subject);
});
