import { MpRawMode } from 'ViperIDE/src/rawmode';

class DeviceFiles{
    constructor(serial, setTree){
        this.serial = serial;
        this.tree = undefined;
        this.setTree = setTree;
        this.last_raw_mode = undefined;
    }

    getTree = () => {
        return this.tree;
    }

    stop = async () => {
        if(this.last_raw_mode != undefined){
            await this.last_raw_mode.interruptProgram();
            await this.last_raw_mode.end();
        }
    }

    // Call this to open file directory chooser on computer
    openFiles = async () => {
        return new Promise(async (resolve, reject) => {
            await stop();
            MpRawMode.begin(this.serial).then(async (raw_mode) => {
                this.last_raw_mode = raw_mode;
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
        return new Promise(async (resolve, reject) => {
            await stop();
            MpRawMode.begin(this.serial).then(async (raw_mode) => {
                this.last_raw_mode = raw_mode;
                let file_data = await raw_mode.readFile(path);
                raw_mode.end();

                resolve(file_data)
            });
        });
    }

    saveFile = (path, valueToSave) => {
        return new Promise(async (resolve, reject) => {
            await stop();
            MpRawMode.begin(this.serial).then(async (raw_mode) => {
                this.last_raw_mode = raw_mode;
                await raw_mode.writeFile(path, valueToSave, 1024);
                raw_mode.end();
                resolve();
            });
        });
    }
}

export default DeviceFiles;