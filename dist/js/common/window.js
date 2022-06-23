// Shows popup on page with error for user to interpret, must be defined at top
// 'stack' should be a new Error().stack for reference if needed
window.showError = (errorText) => {
    console.trace(errorText);
}



window.inputDialog = (question, defaultInputText, callback) => {
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

    let inputString = document.createElement("input");
    inputString.type = "text";
    inputString.classList = "relative w-[100%] h-[25px] p-[10px] border border-black rounded-md";
    inputString.value = defaultInputText;
    inputDialogDiv.appendChild(inputString);
    inputString.focus();
    inputString.select();
    inputString.onkeydown = (event) => {
        if(event.code == "Enter"){
            callback(inputString.value);
            close();
        }
    }

    let btnParentDiv = document.createElement("div");
    btnParentDiv.classList = "relative w-full h-fit flex flew-row justify-evenly mt-2";
    inputDialogDiv.appendChild(btnParentDiv);

    let btnCancel = document.createElement("button");
    btnCancel.classList = "rounded-md w-28 h-8 bg-black hover:bg-white text-white hover:text-black border border-black active:bg-black active:text-white duration-200";
    btnCancel.textContent = "Cancel";
    btnCancel.onclick = (event) => {
        close();
    }
    btnParentDiv.appendChild(btnCancel);

    let btnConfirm = document.createElement("button");
    btnConfirm.classList = "rounded-md w-28 h-8 bg-black hover:bg-white text-white hover:text-black border border-black active:bg-black active:text-white duration-200";
    btnConfirm.textContent = "Confirm";
    btnConfirm.onclick = (event) => {
        callback(inputString.value);
        close();
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
    }
    inputDialogDiv.appendChild(btnExit);
}



window.confirm = (question, callback) => {
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
    }
    btnParentDiv.appendChild(btnCancel);

    let btnConfirm = document.createElement("button");
    btnConfirm.classList = "rounded-md w-28 h-8 bg-black hover:bg-white text-white hover:text-black border border-black active:bg-black active:text-white duration-200";
    btnConfirm.textContent = "Confirm";
    btnConfirm.onclick = (event) => {
        callback();
        close();
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
    }
    inputDialogDiv.appendChild(btnExit);
}




window.folderSelectionShow = (dialog, closeCallback) => {
    let divProjectsLayoutPanel = document.getElementById("divProjectsLayoutPanel");
    let rect = divProjectsLayoutPanel.getBoundingClientRect();

    let overlay1 = document.createElement("div");
    overlay1.classList = "absolute z-30 bg-white opacity-70 top-0 right-0 bottom-0";
    overlay1.style.left = (rect.x + rect.width) + "px"
    document.body.appendChild(overlay1);

    let overlay2 = document.createElement("div");
    overlay2.classList = "absolute z-30 bg-white opacity-70 top-0 left-0";
    overlay2.style.width = (rect.x + rect.width) + "px"
    overlay2.style.height = rect.y + "px"
    document.body.appendChild(overlay2);


    let inputDialogDiv = document.createElement("div");
    inputDialogDiv.classList = "absolute w-[300px] h-fit bg-white border-2 border-black border rounded-md m-auto left-0 right-0 top-0 bottom-0 z-40 flex flex-col p-2";
    document.body.appendChild(inputDialogDiv);


    let dialogDiv = document.createElement("div");
    dialogDiv.classList = "relative w-full h-fit p-1";
    dialogDiv.innerText = dialog;
    inputDialogDiv.appendChild(dialogDiv);

    let btnParentDiv = document.createElement("div");
    btnParentDiv.classList = "relative w-full h-fit flex flew-row justify-evenly";
    inputDialogDiv.appendChild(btnParentDiv);

    let btnCancel = document.createElement("button");
    btnCancel.classList = "rounded-md w-28 h-8 bg-black hover:bg-white text-white hover:text-black border border-black active:bg-black active:text-white duration-200";
    btnCancel.textContent = "Cancel";
    btnCancel.onclick = (event) => {
        close();
    }
    btnParentDiv.appendChild(btnCancel);


    let close = () => {
        document.body.removeChild(overlay1);
        document.body.removeChild(overlay2);
        document.body.removeChild(inputDialogDiv);
        delete overlay1;
        delete overlay2;
        delete inputDialogDiv;

        document.removeEventListener("keydown", escKeyPressed);

        closeCallback();
    }


    let escKeyPressed = (event) => {
        if(event.code == "Escape"){
            close();
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
    }
    inputDialogDiv.appendChild(btnExit);

    return close;
}