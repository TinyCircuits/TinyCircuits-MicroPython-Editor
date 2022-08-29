import { Emulator } from "../../../modules/emulator/emulator.js";

let emulator = new Emulator();
emulator.onOutput = (data) => {
    console.log(new TextDecoder().decode(data));
}

const canvasEmulatorParent = document.getElementById("canvasEmulatorParent");
const canvasEmulator = document.getElementById("canvasEmulator");
const ratio = parseInt(canvasEmulator.width) / parseInt(canvasEmulator.height);


// https://stackoverflow.com/a/41527426
let resize = () => {
    const parentSize = canvasEmulatorParent.getBoundingClientRect();

    const ratioX = parentSize.width / canvasEmulator.width;
    const ratioY = parentSize.height / canvasEmulator.height;
    const ratio1 = Math.min(ratioX, ratioY);
    const ratio2 = Math.max(ratioX, ratioY);

    canvasEmulator.style.width = ((ratio1 * canvasEmulator.width)) + "px";
    canvasEmulator.style.height = ((ratio1 * canvasEmulator.height)) + "px";
}


// Observe if the window gets resized and the emulator should follow
let windowObserver = new ResizeObserver((entries) => resize());
windowObserver.observe(canvasEmulatorParent);

let gameLinkPacks = []
fetch("https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Games/master/url_list.txt", {cache: 'no-store', pragma: 'no-cache'}).then((response) => {
    response.text().then(async (text) => {
        var txtFileLines = text.split(/\r\n|\n|\r/);

        if(txtFileLines.length > 0){
            let pack = [];
            for(var i=0; i < txtFileLines.length; i++){
                if(txtFileLines[i] == ''){
                    gameLinkPacks.push(pack);
                    pack = [];
                }else if(txtFileLines[i].indexOf(".png") == -1 &&
                         txtFileLines[i].indexOf(".webm") == -1 &&
                         txtFileLines[i].indexOf("arcade_description.txt") == -1){
                    pack.push(txtFileLines[i])
                }
            }
        }

        const gameLinkPack = gameLinkPacks[19];
        let fileList = [];
        let projectName = gameLinkPack[0].slice(5);

        for(let idx=1; idx<gameLinkPack.length; idx++){
            let file = {};
            file.path = gameLinkPack[idx].slice(79);
            file.data = await (await fetch(gameLinkPack[idx])).text();

            fileList.push(file);
        }

        console.log(fileList, projectName);
        emulator.startEmulator(fileList, projectName);
    });
});