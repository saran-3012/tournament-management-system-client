export default function limitCalls(minWait, callBack) {
    let lastCall = 0;
    return (...args) => {
        const currentTime = Date.now();
        if(currentTime - lastCall < minWait){
            return;
        }
        lastCall = currentTime;
        callBack(...args);
    };
};
