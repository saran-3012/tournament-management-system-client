export default function ControllableTimeout(handler, timeout, ...args) {
  let remainingTime = timeout;
  let startTime;
  let timeOut;
  let isFinished = false;

  this.pause = function(){
    clearTimeout(timeOut);
    remainingTime -= (Date.now() - startTime);
  }

  this.resume = function(){
    startTime = Date.now();
    timeOut = setTimeout(() => {
      handler(...args);
      isFinished = true;
    }, remainingTime, ...args);
  }

  this.clear = function(){
    clearTimeout(timeOut);
    isFinished = true;
  }

  this.start = function(){
    this.resume();
  }

  this.isFinished = function(){
    return this.isFinished;
  }
};
