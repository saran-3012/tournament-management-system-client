export default function limitCalls(minWait, callBack) {
    let lastCall = 0;
    return (...args) => {
        const currentTime = new Date().getTime();
        if(currentTime - lastCall < minWait){
            return;
        }
        lastCall = currentTime;
        callBack(...args);
    };
};
