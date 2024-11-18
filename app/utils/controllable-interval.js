import ControllableTimeout from './controllable-timeout';

export default function ControllableInterval(handler, timeout, ...args) {

  let interval = null;
  let controllableTimeout = null;
  let isRunning = false; 

  this.pause = function() {
    if (controllableTimeout !== null && !controllableTimeout.isFinished()) {
      controllableTimeout.pause();
    }
    if (interval !== null) {
      clearInterval(interval);
      interval = null;
    }
    isRunning = false;
  };

  this.resume = function(immediate = false) {
    if (isRunning){ 
      return;  
    }

    clearInterval(interval);
    interval = null;

    if (immediate) {
      try {
        handler(...args);  
      } catch (error) {
        console.error('Error in interval handler:', error);
      }
    }

    if (controllableTimeout === null || controllableTimeout.isFinished()) {
      controllableTimeout = new ControllableTimeout(() => {
        try {
          handler(...args); 
        } catch (error) {
          console.error('Error in interval handler:', error);
        }
        interval = setInterval(() => {
          try {
            handler(...args);  
          } catch (error) {
            console.error('Error in interval handler:', error);
          }
        }, timeout);
      }, timeout);
    }

    controllableTimeout.resume();
    isRunning = true;
  };

  this.clear = function() {
    if (controllableTimeout !== null) {
      controllableTimeout.clear();
      controllableTimeout = null;
    }
    if (interval !== null) {
      clearInterval(interval);
      interval = null;
    }
    isRunning = false;
  };

  this.start = function(immediate = false) {
    this.resume(immediate); 
  };

  this.stop = function() {
    this.clear();  
  };

  this.isPaused = function() {
    return !isRunning;
  };

  this.isRunning = function() {
    return isRunning;
  };
}
