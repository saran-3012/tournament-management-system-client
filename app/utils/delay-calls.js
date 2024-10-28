export default function delayCalls(minWait, callBack) {
  let lastCall = 0;
  let callBackTimeout = null;
  return (...args) => {
      const currentTime = Date.now();
      if(currentTime - lastCall < minWait && callBackTimeout !== null){
          clearTimeout(callBackTimeout);
      }
      lastCall = currentTime;
      callBackTimeout = setTimeout(() => {
        lastCall = Date.now(); 
        callBack(...args);
      }, minWait);
  };
};
