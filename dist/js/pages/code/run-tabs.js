// Handle 2D and Script button styles
let BtnRunInBrowser = document.getElementById("BtnRunInBrowser");
let BtnRunOnThumby = document.getElementById("BtnRunOnThumby");

let DivRunInBrowser = document.getElementById("DivRunInBrowser");
let DivRunOnThumby = document.getElementById("DivRunOnThumby");

let DivRunInBrowserConsole = document.getElementById("DivRunInBrowserConsole");
let DivRunOnThumbyConsole = document.getElementById("DivRunOnThumbyConsole");

BtnRunInBrowser.onclick = (ev) => {
    BtnRunInBrowser.classList.remove("bg-black");
    BtnRunInBrowser.classList.remove("text-white");
    BtnRunInBrowser.classList.add("bg-white");
    BtnRunInBrowser.classList.add("text-black");

    BtnRunOnThumby.classList.add("bg-black");
    BtnRunOnThumby.classList.add("text-white");
    BtnRunOnThumby.classList.remove("bg-white");
    BtnRunOnThumby.classList.remove("text-black");

    DivRunInBrowser.classList.remove("invisible");
    DivRunOnThumby.classList.add("invisible");

    DivRunInBrowserConsole.classList.remove("invisible");
    DivRunOnThumbyConsole.classList.add("invisible");

    localStorage.setItem("last-run-tab-btn-clicked", "BtnRunInBrowser");
}
BtnRunOnThumby.onclick = (ev) => {
    BtnRunOnThumby.classList.remove("bg-black");
    BtnRunOnThumby.classList.remove("text-white");
    BtnRunOnThumby.classList.add("bg-white");
    BtnRunOnThumby.classList.add("text-black");

    BtnRunInBrowser.classList.add("bg-black");
    BtnRunInBrowser.classList.add("text-white");
    BtnRunInBrowser.classList.remove("bg-white");
    BtnRunInBrowser.classList.remove("text-black");

    DivRunOnThumby.classList.remove("invisible");
    DivRunInBrowser.classList.add("invisible");

    DivRunOnThumbyConsole.classList.remove("invisible");
    DivRunInBrowserConsole.classList.add("invisible");

    localStorage.setItem("last-run-tab-btn-clicked", "BtnRunOnThumby");
}

// Make sure the correct tab is selected from last time
let lastRunTabBtnClicked = localStorage.getItem("last-run-tab-btn-clicked");
if(lastRunTabBtnClicked != null){
    if(lastRunTabBtnClicked == "BtnRunInBrowser"){
        BtnRunInBrowser.click();
    }else if(lastRunTabBtnClicked == "BtnRunOnThumby"){
        BtnRunOnThumby.click();
    }
}else{
    BtnRunInBrowser.click();
}