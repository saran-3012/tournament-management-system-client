export default function ControllableTimeout(handler, timeout, ...args) {
  let remainingTime = timeout;
  let startTime;
  let timeOut;

  this.pause = function(){
    clearTimeout(timeOut);
    remainingTime -= (Date.now() - startTime);
  }

  this.resume = function(){
    startTime = Date.now();
    timeOut = setTimeout(handler, remainingTime, ...args);
  }

  this.clear = function(){
    clearTimeout(timeOut);
    handler(...args);
  }

  this.start = function(){
    this.resume();
  }
};
