
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('millis-to-date-time', 'helper:millis-to-date-time', {
  integration: true
});

// Replace this with your real tests.
test('it renders', function(assert) {
  this.set('inputValue', '1234');

  this.render(hbs`{{millis-to-date-time inputValue}}`);

  assert.equal(this.$().text().trim(), '1234');
});

