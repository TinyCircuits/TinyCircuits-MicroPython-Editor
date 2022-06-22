window.inputDialog = (question, defaultInputText, callback) => {
    let overlayDiv = document.createElement("div");
    overlayDiv.classList = "absolute z-30 left-0 top-0 right-0 bottom-0 bg-white opacity-60";
    document.body.appendChild(overlayDiv);

    let inputDialogDiv = document.createElement("div");
    inputDialogDiv.classList = "absolute w-[300px] h-fit bg-white border-2 border-black border rounded-md m-auto left-0 right-0 top-0 bottom-0 z-40 flex flex-col p-2";
    document.body.appendChild(inputDialogDiv);

    let questionDiv = document.createElement("div");
    questionDiv.classList = "relative w-full h-fit";
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


    let close = () => {
        document.body.removeChild(overlayDiv);
        document.body.removeChild(inputDialogDiv);
        delete overlayDiv;
        delete inputDialogDiv;
    }


    let escKeyPressed = (event) => {
        if(event.code == "Escape"){
            document.removeEventListener("keydown", escKeyPressed);
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