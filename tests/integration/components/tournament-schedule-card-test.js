import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('tournament-schedule-card', 'Integration | Component | tournament schedule card', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{tournament-schedule-card}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#tournament-schedule-card}}
      template block text
    {{/tournament-schedule-card}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
