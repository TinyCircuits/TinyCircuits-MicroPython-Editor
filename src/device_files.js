import { MpRawMode } from 'ViperIDE/src/rawmode';

class DeviceFiles{
    constructor(serial, setTree){
        this.serial = serial;
        this.tree = undefined;
        this.setTree = setTree;
    }

    getTree = () => {
        return this.tree;
    }

    // Call this to open file directory chooser on computer
    openFiles = async () => {
        return new Promise((resolve, reject) => {
            MpRawMode.begin(this.serial).then(async (raw_mode) => {
                raw_mode.walkFs().then((tree) => {
                    this.tree = tree;
                    if(this.setTree != undefined) this.setTree(this.tree);
                    raw_mode.end();
                    resolve();
                }).catch((error) => {
                    console.error(error);
                    reject();
                })
            });
        });
    }

    openFile = async (path) => {
        return new Promise((resolve, reject) => {
            MpRawMode.begin(this.serial).then(async (raw_mode) => {
    
                let file_data = await raw_mode.readFile(path);
                raw_mode.end();

                resolve(file_data)
            });
        });
    }

    saveFile = (path, valueToSave) => {
        return new Promise((resolve, reject) => {
            MpRawMode.begin(this.serial).then(async (raw_mode) => {
                await raw_mode.writeFile(path, valueToSave, 1024);
                raw_mode.end();
                resolve();
            });
        });
    }
}

export default DeviceFiles;