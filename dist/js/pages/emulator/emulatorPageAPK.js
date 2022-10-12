window.main = () => {
    console.warn("Ready to play games!");

    document.getElementById("thumbyIcon").style.visibility = "hidden";

    document.getElementById("btnOpenArcade").click();
}



// Setup game browser after page loaded and all elements in place
document.addEventListener('DOMContentLoaded', function() {
    let gameLinkPacks = []

    let gameCount = document.getElementById("gameCount");
    let currentGameIndex = 0;

    let observer = new IntersectionObserver((entries, observer) => {
        if(entries.length == 1){
            let divGameList = document.getElementById("divGameList");
            let gameIndex = Array.prototype.indexOf.call(divGameList.children, entries[0].target);
            currentGameIndex = gameIndex;
            gameCount.innerText = (gameIndex+1) + "/" + gameLinkPacks.length-1;
        }
    }, {root: document.getElementById("divGameScrollContainer"), rootMargin: "0px", threshold: 1.0});


    document.getElementById("btnPlay").onclick = (event) => {
        let id = divGameList.children[currentGameIndex].id;

        window.Module.PyRun_SimpleString("exec(open(\"/data/data/building/assets/Games/" + id + "/" + id + ".py\").read())\r\n");

        document.getElementById("btnBackToGame").click();
        document.getElementById("canvas").style.visibility = "visible";
    }

    document.getElementById("btnScrollRight").onclick = (event) => {
        if(currentGameIndex+1 < divGameList.children.length){
            currentGameIndex++;
            divGameList.children[currentGameIndex].scrollIntoView({behavior: "smooth"});
        }
    }

    document.getElementById("btnScrollLeft").onclick = (event) => {
        if(currentGameIndex-1 >= 0){
            currentGameIndex--;
            divGameList.children[currentGameIndex].scrollIntoView({behavior: "smooth"});
        }
    }


    fetch("https://raw.githubusercontent.com/TinyCircuits/TinyCircuits-Thumby-Games/master/url_list.txt", {cache: 'no-store', pragma: 'no-cache'}).then((response) => {
        response.text().then(async (text) => {
            var txtFileLines = text.split(/\r\n|\n|\r/);

            if(txtFileLines.length > 0){
                let pack = {"projectName": "", "gameFiles": [], "mediaFiles": []};
                for(var i=0; i < txtFileLines.length; i++){
                    if(txtFileLines[i] == ''){
                        gameLinkPacks.push(pack);
                        pack = {"projectName": "", "gameFiles": [], "mediaFiles": []};
                    }else if(txtFileLines[i].indexOf(".png") != -1 || txtFileLines[i].indexOf(".webm") != -1 || txtFileLines[i].indexOf("arcade_description.txt") != -1){
                        pack["mediaFiles"].push(txtFileLines[i]);
                    }else if(txtFileLines[i].indexOf("NAME=") != -1){
                        pack["projectName"] = txtFileLines[i].slice(5);
                    }else{
                        pack["gameFiles"].push(txtFileLines[i]);
                    }
                }
            }


            let divGameList = document.getElementById("divGameList");

            for(let igx=0; igx<gameLinkPacks.length-1; igx++){
                let pack = gameLinkPacks[igx];
                
                let previewElement = undefined;

                // Try to find a video file for the game preview
                for(let imx=0; imx<pack.mediaFiles.length; imx++){
                    if(pack.mediaFiles[imx].indexOf(".webm") != -1){
                        previewElement = document.createElement("video");
                        previewElement.src = pack.mediaFiles[imx];
                        previewElement.muted = true;
                        previewElement.loop = true;
                        previewElement.autoplay = true;
                        previewElement.classList = "w-full";
                        previewElement.style.height = "inherit";
                        break;
                    }
                }

                // Try to find an image file for the game preview
                if(previewElement == undefined){
                    for(let imx=0; imx<pack.mediaFiles.length; imx++){
                        if(pack.mediaFiles[imx].indexOf(".png") != -1){
                            previewElement = document.createElement("img");
                            previewElement.src = pack.mediaFiles[imx];
                            previewElement.classList = "w-full h-full object-contain";
                            break;
                        }
                    }
                }

                // Show error in console if no preview media is found
                if(previewElement == undefined){
                    console.error("Could not find preview media for game", pack);
                }
                
                let divGame = document.createElement("div");
                divGame.classList = "min-h-full ml-32 snap-center"
                divGame.innerHTML = `
                <div class="min-h-[50%] aspect-square mt-[50%] relative select-none">
                    <div class="absolute top-0 bottom-0 left-0 right-0 flex justify-center">
                        <div class="text-3xl translate-y-[-50px] select-none">
                        ` +
                            pack["projectName"]
                        + `
                        </div>
                    </div>
                    <div class="absolute top-0 bottom-0 left-0 right-0 bg-base-300 rounded-2xl">
                        <div class="w-full h-full relative flex items-center justify-center">
                        </div>
                    </div>
                </div>
                `
                divGameList.appendChild(divGame);
                divGame.children[0].children[1].children[0].appendChild(previewElement);
                divGame.id = pack["projectName"];
                observer.observe(divGame);
            }

            gameCount.innerText = "1/" + gameLinkPacks.length;
        });
    });
}, false);