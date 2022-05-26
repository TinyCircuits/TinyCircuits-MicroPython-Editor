class TabsHandler{
    constructor(parentDiv, defaultTabNamesList, floatRight = true, showAddButton = false, showCloseButton = false, tabCreateCallback = (tabName, tabDiv) => {}, tabCloseCallback = (tabName, tabDiv) => {}, titleText=""){
        // Callbacks that get overridden by external modules
        this.onTabCreate = tabCreateCallback;
        this.onTabClose = tabCloseCallback;
        
        this.floatRight = floatRight;

        this.parentDiv = parentDiv;
        this.showAddButton = showAddButton;
        this.showCloseButton = showCloseButton;

        this.tabNotSelectedStyle = "flex items-center bg-black hover:bg-white text-white hover:text-black active:bg-black active:text-white stroke-white duration-200";
        this.tabSelectedStyle = "flex items-center bg-white hover:bg-white text-black hover:text-black active:bg-black active:text-white stroke-white duration-200";
        this.tabBtnStyle = "m-2 inline-flex items-center select-none";
        this.tabCloseBtnStyle = "inline-flex items-center w-4 h-4 mr-2";
        this.addBtnStyle = "flex items-center justify-center w-6 bg-black hover:bg-white text-white hover:text-black active:bg-black active:text-white duration-200";

        // Need parent to have an id to keep the tab group unique
        if(this.parentDiv.id == undefined || this.parentDiv.id == null || this.parentDiv.id == ""){
            console.error("Tab parent div had no id, stopped");
            return undefined;
        }

        // Setup the header
        this.headerDiv = document.createElement("div");
        if(floatRight){
            this.headerDiv.classList = "thumby-tab-header-right";
        }else{
            this.headerDiv.classList = "thumby-tab-header-left";
        }
        this.headerDiv.id = this.parentDiv.id + "TabHeader";
        this.parentDiv.appendChild(this.headerDiv);


        // Try to restore tabs based on parent id, else use the defaults, if there are any and click the first one
        let restorableTabNames = localStorage.getItem(this.parentDiv.id + "RestorableTabIDs");
        if(restorableTabNames != null){
            restorableTabNames = JSON.parse(restorableTabNames);
            for(let i = 0; i < restorableTabNames.length; i++){
                this.#addTabDiv(restorableTabNames[i]);
            }
        }else{
            if(defaultTabNamesList != undefined){
                for (let i = 0; i < defaultTabNamesList.length; i++){
                    this.#addTabDiv(defaultTabNamesList[i]);
                }

                // Click the first tab, could do this a more performant way but this is done once for first page load
                if(this.headerDiv.children.length > 0){
                    this.headerDiv.children[0].children[0].click();
                }
            }
        }

        this.#AddAddButton();

        // Don't let tab handlers that float right to move tabs, simply not setup for it
        if(floatRight == false){
            this.mouseDownEventHandle = (event) => {this.#handleMouseDown(event)};
            document.addEventListener("mousedown", this.mouseDownEventHandle);
        }else{
            // Add title if floating right
            this.titleDiv = document.createElement("div");
            this.titleDiv.classList = "thumby-tab-title-div";
            this.titleDiv.textContent = titleText;
            this.headerDiv.appendChild(this.titleDiv);
        }

        // Callback that gets called when tabs change - up to code using this module to define
        this.onTabChange = undefined;
    }


    #handleMouseDown(event){
        // Only tabs can be dragged, check that click was in the bounds and the element was a tab button only
        if(event.target.id.indexOf(this.parentDiv.id + "TabButton") != -1){
            event.target.click();

            this.draggingTab = event.target.parentElement;

            this.dragX = event.clientX - this.draggingTab.offsetLeft;
            this.dragY = event.clientY - this.draggingTab.offsetTop;

            this.dragStartTime = Date.now();

            this.mouseMoveEventHandle = (event) => {this.#handleMouseMove(event)};
            this.mouseUpEventHandle = (event) => {this.#handleMouseUp(event)};
            document.addEventListener('mousemove', this.mouseMoveEventHandle);
            document.addEventListener('mouseup', this.mouseUpEventHandle);
        }
    }


    #handleMouseMove(event){
        if(this.draggingTab != undefined){
            // How far the mouse has been moved
            const dx = event.clientX - this.dragX;
            const dy = event.clientY - this.dragY;

            // Only put tab into drag mode if moved a certain distance and longer than a certain amount of time
            if((Math.abs(dx) > 1 || Math.abs(dy) > 1) && Date.now() - this.dragStartTime > 100){
                this.draggingTab.classList = "thumby-tab-container-dragging";

                let x = this.draggingTab.offsetLeft + dx;
                let y = this.draggingTab.offsetTop + dy;

                // Find the closest tab to dock this tab before
                let smallestDistance = Infinity;
                let smallestDistanceElemIndex = -1;
                for(let cidx=0; cidx<this.headerDiv.children.length; cidx++){
                    if(this.headerDiv.children[cidx].id != this.draggingTab.id){
                        let distance = Math.abs(this.headerDiv.children[cidx].offsetLeft - x);
                        if(distance <= smallestDistance){
                            smallestDistance = distance;
                            smallestDistanceElemIndex = cidx;
                        }
                    }
                    this.headerDiv.children[cidx].style.borderLeft = "1px solid black";
                }
                this.headerDiv.children[smallestDistanceElemIndex].style.borderLeft = "1px solid white";
                this.dragBeforeElem = this.headerDiv.children[smallestDistanceElemIndex];

                // Set the position of element
                this.draggingTab.style.left = x + 'px';
                this.draggingTab.style.top = y + 'px';

                // Update the drag position
                this.dragX = event.clientX;
                this.dragY = event.clientY;
            }
        }
    }


    #handleMouseUp(event){
        document.removeEventListener('mousemove', this.mouseMoveEventHandle);
        document.removeEventListener('mouseup', this.mouseUpEventHandle);

        // Style as selected
        this.draggingTab.classList = this.tabSelectedStyle;
        this.draggingTab.style.left = null;
        this.draggingTab.style.top = null;

        if(this.dragBeforeElem != undefined){
            this.headerDiv.insertBefore(this.draggingTab, this.dragBeforeElem);
            this.dragBeforeElem.style.borderLeft = "1px solid #606164";
        }

        this.draggingTab = undefined;
        this.dragBeforeElem = undefined;

        this.#updateRestorableTabs();
    }


    #AddAddButton(){
        if(this.showAddButton){
            this.addButton = document.getElementById(this.parentDiv.id + "AddButton");

            // First time existing, so create it and do not need to move
            if(this.addButton == null){
                this.addButton = document.createElement("button");
                this.addButton.id = this.parentDiv.id + "AddButton";
                this.addButton.classList = this.addBtnStyle;
                this.addButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full" viewBox="0 0 20 20" fill="currentColor" stroke-width="0">
                    <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                `;

                this.addButton.onclick = (event) => {
                    this.#addTabDiv("Untitled");
                    this.headerDiv.removeChild(this.addButton);
                    this.headerDiv.children[this.headerDiv.children.length-1].children[0].click();
                    this.headerDiv.appendChild(this.addButton);
                }
                this.headerDiv.appendChild(this.addButton);
            }
        }
    }


    // Brute-force update list of tab names that can be restored
    #updateRestorableTabs(){
        let tabNames = [];
        for (let i = 0; i < this.headerDiv.children.length; i++){
            let tabButton = this.headerDiv.children[i].children[0];
            if(tabButton != undefined && this.headerDiv.children[i].id != this.parentDiv.id + "AddButton"){
                tabNames.push(tabButton.textContent);
            }
        }
        localStorage.setItem(this.parentDiv.id + "RestorableTabIDs", JSON.stringify(tabNames));
    }


    // Hide all other tab parent divs and set styling on click + non-clicked tabs
    #handleTabClick(event){
        // Set this tab button as active
        event.target.parentElement.classList = this.tabSelectedStyle;

        localStorage.setItem(this.parentDiv.id + "LastClickedTabName", event.target.textContent);

        // Set this tab div as visible
        let tabDivID = this.parentDiv.id + "TabDiv" + event.target.textContent;
        document.getElementById(tabDivID).style.visibility = "visible";

        // Make sure all other tab buttons are not active
        for (let i = 0; i < this.headerDiv.children.length; i++){
            let tabButton = this.headerDiv.children[i].children[0];
            if(tabButton != undefined && tabButton.textContent != event.target.textContent){
                this.headerDiv.children[i].classList = this.tabNotSelectedStyle;
            }
        }

        // Make sure all other tab divs are not visible (look out for current div and header div)
        for(let i = 0; i < this.parentDiv.children.length; i++){
            if(this.parentDiv.children[i].id != this.headerDiv.id && this.parentDiv.children[i].id != tabDivID){
                this.parentDiv.children[i].style.visibility = "hidden";
            }
        }

        if(this.onTabChange != undefined) this.onTabChange();
    }


    // Add a tab button to tab header and save id to make it restorable in the future
    #addTabDiv(name){
        let newTabIndex = 0;
        if(document.getElementById(this.parentDiv.id + "TabButton" + name) != null){
            while(document.getElementById(this.parentDiv.id + "TabButton" + name + newTabIndex) != null){
                newTabIndex++;
            }
            name = name + newTabIndex;
        }

        // Each tab has a container for the tab and close buttons
        let newTabContainerDiv = document.createElement("div");
        newTabContainerDiv.classList = this.tabNotSelectedStyle;
        newTabContainerDiv.id = this.parentDiv.id + "TabContainer" + name;
        this.headerDiv.appendChild(newTabContainerDiv);

        // Tab button
        let newTabButton = document.createElement("button");
        newTabButton.classList = this.tabBtnStyle;
        newTabButton.id = this.parentDiv.id + "TabButton" + name;
        newTabButton.textContent = name;
        newTabButton.onclick = (event) => {this.#handleTabClick(event)};
        newTabContainerDiv.appendChild(newTabButton);

        // Tab div
        let newTabDiv = document.createElement("div");
        newTabDiv.classList = "thumby-tab-div";
        newTabDiv.id = this.parentDiv.id + "TabDiv" + name;
        this.parentDiv.appendChild(newTabDiv);

        // New tab, update list of tabs that can be restore don page refresh
        this.#updateRestorableTabs();

        // If the close button should be shown for this group, setup it each time a tab is added
        if(this.showCloseButton){
            // Create close button
            let newTabCloseButton = document.createElement("button");
            newTabCloseButton.classList = this.tabCloseBtnStyle;
            newTabCloseButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full" viewBox="0 0 20 20" fill="currentColor" stroke-width="0">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            `;
            newTabContainerDiv.appendChild(newTabCloseButton);

            // Change close button opacity on tab container focus
            // newTabContainerDiv.onmouseover = (event) => {
            //     newTabCloseButton.style.opacity = 1.0;
            // }
            // newTabContainerDiv.onmouseout = (event) => {
            //     newTabCloseButton.style.opacity = 0.1;
            // }

            // Remove this tab on close and update tabs that can be restored
            newTabCloseButton.onclick = (event) => {
                this.onTabClose(name, newTabDiv);
                // When closing tab, focus a new tab if possible, do not focus on add button that has no child elements
                if(newTabContainerDiv.nextElementSibling != undefined && newTabContainerDiv.nextElementSibling.children.length > 1){
                    newTabContainerDiv.nextElementSibling.children[0].click();
                }else if(newTabContainerDiv.previousElementSibling != undefined){
                    newTabContainerDiv.previousElementSibling.children[0].click();
                }
                newTabContainerDiv.remove();
                newTabDiv.remove();
                this.#updateRestorableTabs()
            }
        }

        // Click the last tab that was selected last time, setup everything so tab is visible
        let lastClickedTabName = localStorage.getItem(this.parentDiv.id + "LastClickedTabName");
        if(lastClickedTabName != null && lastClickedTabName == name){
            newTabContainerDiv.classList = this.tabSelectedStyle;
            newTabDiv.style.visibility = "visible";
        }

        this.onTabCreate(name, newTabDiv);
    }


    // Fetch a tab div by the name of shown in the tab
    getTabDiv(name){
        let tabDivID = this.parentDiv.id + "TabDiv" + name;
        return document.getElementById(tabDivID);
    }
}

export { TabsHandler }