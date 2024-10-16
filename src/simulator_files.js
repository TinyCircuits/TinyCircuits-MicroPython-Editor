class SimulatorFiles{
    constructor(fs, setTree){
        this.fs = fs;                       // Emscripten filesystem object
        this.tree = undefined;
        this.full_path_files = undefined;   // A dictionary where full file paths are keys and file handles are values
        this.setTree = setTree;
    }

    getTree = () => {
        return this.tree;
    }

    
    openFiles = async () => {
        
    }

    openFile = async (path) => {
        
    }

    saveFile = async (path, valueToSave) => {
        
    }
}

export default SimulatorFiles;