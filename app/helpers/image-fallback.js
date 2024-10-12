import Ember from 'ember';

export function imageFallback([imageUrl]) {
  return imageUrl || 'images/tournament-place-holder.svg';
}

export default Ember.Helper.helper(imageFallback);
