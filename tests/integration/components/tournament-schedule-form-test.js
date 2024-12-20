import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('tournament-schedule-form', 'Integration | Component | tournament schedule form', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{tournament-schedule-form}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#tournament-schedule-form}}
      template block text
    {{/tournament-schedule-form}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
