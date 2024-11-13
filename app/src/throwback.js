// Sets search parameter to `throwback` to the current path name
// so that when `handleThrowback` is called we can be redirected
// (i.e. thrown back) to the place that redirected us in the first
// palce
function setThrowback(newPathName){
    // Search `throwback` search term to current `pathname`
    window.location.href = decodeURIComponent(newPathName + "?throwback=" + window.location.pathname.toString());
}

// If there is a URL query string with key `throwback`, then redirect
// to there when this is called. Otherwise, return false
function handleThrowback(){
    const urlParams = new URLSearchParams(window.location.search);
    const throwback = urlParams.get('throwback');

    if(throwback == null){
        return false;
    }else{
        window.location.href = throwback;
        return true;
    }
}

export {setThrowback, handleThrowback};