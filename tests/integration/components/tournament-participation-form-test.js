import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('tournament-participation-form', 'Integration | Component | tournament participation form', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{tournament-participation-form}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#tournament-participation-form}}
      template block text
    {{/tournament-participation-form}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
