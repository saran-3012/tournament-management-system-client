
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('image-fallback', 'helper:image-fallback', {
  integration: true
});

// Replace this with your real tests.
test('it renders', function(assert) {
  this.set('inputValue', '1234');

  this.render(hbs`{{image-fallback inputValue}}`);

  assert.equal(this.$().text().trim(), '1234');
});

