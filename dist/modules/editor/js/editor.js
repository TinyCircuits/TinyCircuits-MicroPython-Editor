import { TabsHandler } from "../../tabs-handler/js/tabs-handler.js";
import { PageDB } from "../../page-db/js/page-db.js";

class Editor{
    constructor(parentElem){
        // Fetch panel HTML and then setup everything up
        this.pageDB = new PageDB();

        this.shellTabsHandler = new TabsHandler(parentElem, ["HelloWorld.py"], false, true, true, (tabName, tabDiv) => {this.#initEditor(tabName, tabDiv)}, (tabName, tabDiv) => {this.#deleteEditor(tabName, tabDiv)});
    }


    #deleteEditor(tabName, tabDiv){
        this.pageDB.deleteEditorFile(tabName);
    }


    // Used in the tab handler to setup each editor tab
    #initEditor(tabName, tabDiv){
        let editor = ace.edit(tabDiv);
        editor.setTheme("ace/theme/chrome");
        editor.session.setMode("ace/mode/python");

        this.pageDB.getEditorFile(tabName, (data) => {
            editor.setValue(data, 1);
        });

        editor.session.on('change', (event) => {
            this.pageDB.addEditorFile(editor.getValue(), tabName);
        });


        // Paste special getting started code if first time loading page
        // if(tabName == "HelloWorld.py" && localStorage.getItem("FirstEditorLoad") == null){
        //     localStorage.setItem("FirstEditorLoad", false);
        //     // fetch("/modules/thumby-editor/HelloWorld.py")
        //     // .then(async (result) => {
        //     //     editor.setValue(await result.text(), 1);
        //     // });
        // }
    }


    addTab(){
        this.shellTabsHandler.addButton.click();
    }
}

export { Editor }