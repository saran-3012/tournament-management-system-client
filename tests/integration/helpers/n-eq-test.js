
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('n-eq', 'helper:n-eq', {
  integration: true
});

// Replace this with your real tests.
test('it renders', function(assert) {
  this.set('inputValue', '1234');

  this.render(hbs`{{n-eq inputValue}}`);

  assert.equal(this.$().text().trim(), '1234');
});

