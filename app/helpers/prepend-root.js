import Ember from 'ember';

export function prependRoot([url]) {
  if(!url){
    return '';
  }
  if(url.startsWith("http://") || url.startsWith("https://")){
    return url;
  }
  return `/tms/client/assets/${url}`;
}

export default Ember.Helper.helper(prependRoot);
