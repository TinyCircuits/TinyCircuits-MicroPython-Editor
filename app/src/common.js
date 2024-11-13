const reportError = (customMessage, error) => {
    let errorStr = "Nothing here...";

    if(error != undefined){
        errorStr = error.toString();
    }
    window.dispatchEvent(new CustomEvent("show_error", {detail: {customMessage: customMessage, errorStr: errorStr}}));
}

export default reportError;