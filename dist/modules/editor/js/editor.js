import { TabsHandler } from "../../tabs-handler/js/tabs-handler.js";

class Editor{
    constructor(parentElem){
        // Fetch panel HTML and then setup everything up
        // this.DB = new DB("CODE_EDITOR");

        // The tabs handler will remember the open tabs, their location, and what was clicked
        this.shellTabsHandler = new TabsHandler(parentElem, [], false, true, true, (tabName, tabDiv) => {return this.#initEditor(tabName, tabDiv)}, (tabName, tabDiv) => {this.#closeEditor(tabName, tabDiv)});
    }


    #closeEditor(tabName, tabDiv){
        // this.DB.deleteEditorFile(tabName);
    }


    // Used in the tab handler to setup each editor tab
    #initEditor(tabName, tabDiv){
        let editor = ace.edit(tabDiv);
        editor.setTheme("ace/theme/chrome");
        editor.session.setMode("ace/mode/python");

        // this.DB.getEditorFile(tabName, (data) => {
        //     editor.setValue(data, 1);
        // });

        // editor.session.on('change', (event) => {
        //     this.DB.addEditorFile(editor.getValue(), tabName);
        // });

        return editor;


        // Paste special getting started code if first time loading page
        // if(tabName == "HelloWorld.py" && localStorage.getItem("FirstEditorLoad") == null){
        //     localStorage.setItem("FirstEditorLoad", false);
        //     // fetch("/modules/thumby-editor/HelloWorld.py")
        //     // .then(async (result) => {
        //     //     editor.setValue(await result.text(), 1);
        //     // });
        // }
    }


    addTab(name){
        return this.shellTabsHandler.addTab(name);
    }
}

export { Editor }