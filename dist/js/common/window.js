// Shows popup on page with error for user to interpret, must be defined at top
// 'stack' should be a new Error().stack for reference if needed
window.showError = (errorText) => {
    console.trace(errorText);
}



window.handleInputDialog = (question, defaultInputText, callback) => {
    
}



window.confirm = (question, callback = () => {}) => {
    return new Promise((resolve) => {
        let overlayDiv = document.createElement("div");
        overlayDiv.classList = "absolute z-30 left-0 top-0 right-0 bottom-0 bg-white opacity-60";
        document.body.appendChild(overlayDiv);

        let inputDialogDiv = document.createElement("div");
        inputDialogDiv.classList = "absolute w-[300px] h-fit bg-white border-2 border-black border rounded-md m-auto left-0 right-0 top-0 bottom-0 z-40 flex flex-col p-2";
        document.body.appendChild(inputDialogDiv);

        let questionDiv = document.createElement("div");
        questionDiv.classList = "relative w-full h-fit p-1";
        questionDiv.innerText = question;
        inputDialogDiv.appendChild(questionDiv);

        let btnParentDiv = document.createElement("div");
        btnParentDiv.classList = "relative w-full h-fit flex flew-row justify-evenly";
        inputDialogDiv.appendChild(btnParentDiv);

        let btnCancel = document.createElement("button");
        btnCancel.classList = "rounded-md w-28 h-8 bg-black hover:bg-white text-white hover:text-black border border-black active:bg-black active:text-white duration-200";
        btnCancel.textContent = "Cancel";
        btnCancel.onclick = (event) => {
            close();
            resolve(false);
        }
        btnParentDiv.appendChild(btnCancel);

        let btnConfirm = document.createElement("button");
        btnConfirm.classList = "rounded-md w-28 h-8 bg-black hover:bg-white text-white hover:text-black border border-black active:bg-black active:text-white duration-200";
        btnConfirm.textContent = "Confirm";
        btnConfirm.onclick = (event) => {
            close();
            callback();
            resolve(true);
        }
        btnParentDiv.appendChild(btnConfirm);


        let close = () => {
            document.body.removeChild(overlayDiv);
            document.body.removeChild(inputDialogDiv);
            delete overlayDiv;
            delete inputDialogDiv;

            document.removeEventListener("keydown", escKeyPressed);
        }


        let escKeyPressed = (event) => {
            if(event.code == "Escape"){
                close();
                resolve(false);
            }
        }
        document.addEventListener("keydown", escKeyPressed);


        let btnExit = document.createElement("button");
        btnExit.classList = "w-[15px] h-[15px] absolute right-1 top-1 fill-black active:fill-white duration-100"
        btnExit.innerHTML =
        `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full fill-inherit stroke-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
        `;
        btnExit.onclick = (event) => {
            close();
            resolve(false);
        }
        inputDialogDiv.appendChild(btnExit);
    });
}


window.prompt = (question, callback = () => {}) => {
    return new Promise((resolve) => {
        let overlayDiv = document.createElement("div");
        overlayDiv.classList = "absolute z-30 left-0 top-0 right-0 bottom-0 bg-white opacity-60";
        document.body.appendChild(overlayDiv);

        let inputDialogDiv = document.createElement("div");
        inputDialogDiv.classList = "absolute w-[500px] h-fit bg-white border-2 border-black border rounded-md m-auto left-0 right-0 top-0 bottom-0 z-40 flex flex-col p-2";
        document.body.appendChild(inputDialogDiv);

        let questionDiv = document.createElement("div");
        questionDiv.classList = "relative w-full h-fit p-1";
        questionDiv.innerText = question;
        inputDialogDiv.appendChild(questionDiv);

        let btnParentDiv = document.createElement("div");
        btnParentDiv.classList = "relative w-full h-fit flex flew-row justify-evenly";
        inputDialogDiv.appendChild(btnParentDiv);


        let input = document.createElement("input");
        input.classList = "border border-black"
        input.type = "text";
        btnParentDiv.appendChild(input);

        input.onkeydown = (event) => {
            if(event.key == "Enter"){
                close();
                resolve(input.value);
            }
        }


        let close = () => {
            document.body.removeChild(overlayDiv);
            document.body.removeChild(inputDialogDiv);
            delete overlayDiv;
            delete inputDialogDiv;

            document.removeEventListener("keydown", escKeyPressed);
        }


        let escKeyPressed = (event) => {
            if(event.code == "Escape"){
                close();
                resolve("");
            }
        }
        document.addEventListener("keydown", escKeyPressed);


        let btnExit = document.createElement("button");
        btnExit.classList = "w-[15px] h-[15px] absolute right-1 top-1 fill-black active:fill-white duration-100"
        btnExit.innerHTML =
        `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full fill-inherit stroke-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
        `;
        btnExit.onclick = (event) => {
            close();
            resolve("");
        }
        inputDialogDiv.appendChild(btnExit);
    });
}





window.load = (percent, text, increase=false) => {
    let divLoadingBar = document.getElementById("divLoadingBar");

    if(increase == true){
        let barPercent = parseFloat(divLoadingBar.children[0].style.width);
        if(barPercent >= 100){
            barPercent = 0;
        }
        percent = barPercent + percent;
    }

    divLoadingBar.children[0].style.width = percent + "%";
    divLoadingBar.children[0].children[0].innerText = text + " (" + percent.toFixed(0) + "%)";
}


window.loadStop = (doneMessage, timeout=2000) => {
    setTimeout(() => {
        divLoadingBar.children[0].style.width = 0 + "%";
        if(doneMessage != undefined){
            divLoadingBar.children[0].children[0].innerText = doneMessage;
        }else{
            divLoadingBar.children[0].children[0].innerText = "";
        }
    }, timeout);
}