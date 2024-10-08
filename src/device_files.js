import { MpRawMode } from 'ViperIDE/src/rawmode';

class DeviceFiles{
    constructor(serial, setTree){
        this.dir_handle = undefined;
        this.serial = serial;
        this.tree = undefined;
        this.setTree = setTree;
    }

    // Call this to open file directory chooser on computer
    openFiles = () => {
        MpRawMode.begin(this.serial).then(async (raw_mode) => {
            console.log(raw_mode);

            this.tree = await raw_mode.walkFs();
            this.setTree(this.tree);
            raw_mode.end();
        });
    }

    openFile = async (path) => {
        return new Promise((resolve, reject) => {
            MpRawMode.begin(this.serial).then(async (raw_mode) => {
    
                let file_data = await raw_mode.readFile(path);
                raw_mode.end();

                resolve(new TextDecoder().decode(file_data))
            });
        })
    }
}

export default DeviceFiles;