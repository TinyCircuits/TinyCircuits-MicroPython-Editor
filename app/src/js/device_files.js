import { MpRawMode } from 'ViperIDE/src/rawmode';
import MpRawModeOverride from './MpRawModeOverride';

class DeviceFiles{
    constructor(serial, setTree, progressCB = (percent) => {}){
        this.serial = serial;
        this.tree = undefined;
        this.setTree = setTree;
        this.progressCB = progressCB;
    }

    getTree = () => {
        return this.tree;
    }

    // Call this to open file directory chooser on computer
    openFiles = async (refresh=false) => {
        return new Promise(async (resolve, reject) => {
            console.log("Open files: Attempting to enter raw mode...");
            this.progressCB(0.01);

            MpRawMode.begin(this.serial).then(async (raw_mode) => {
                console.log("Open files: Entered raw mode!");
                this.progressCB(0.1);

                raw_mode.walkFs().then(async (content) => {
                    this.tree = [];
                    this.tree.push({name:"/", path:"/", content:content});
                    
                    // this.tree = tree;

                    if(this.setTree != undefined) this.setTree(this.tree);
                    this.progressCB(0.8);
                    await raw_mode.end();
                    this.progressCB(1.0);
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
            MpRawMode.begin(this.serial).then(async (raw_mode) => {
                let file_data = await raw_mode.readFile(path);
                await raw_mode.end();
                resolve(file_data)
            });
        });
    }

    saveFile = (path, valueToSave) => {
        return new Promise(async (resolve, reject) => {
            MpRawMode.begin(this.serial).then(async (raw_mode) => {
                await raw_mode.writeFile(path, valueToSave, 1024);
                await raw_mode.end();
                resolve();
            });
        });
    }

    newFile = async (path, name) => {
        MpRawModeOverride.begin(this.serial).then(async (raw_mode) => {
            path = path + (path == "" ? "" : "/") + name;
            await raw_mode.newFile(path);
            await raw_mode.end();
        });
    }

    newFolder = async (path, name) => {
        MpRawMode.begin(this.serial).then(async (raw_mode) => {
            path = path + (path == "" ? "" : "/") + name;
            await raw_mode.makePath(path);
            await raw_mode.end();
        });
    }

    rename = async (oldPath, newPath) => {
        MpRawModeOverride.begin(this.serial).then(async (raw_mode) => {
            await raw_mode.rename(oldPath, newPath);
            await raw_mode.end();
        });
    }

    delete = async (path) => {
        MpRawModeOverride.begin(this.serial).then(async (raw_mode) => {
            await raw_mode.deleteFileOrDir(path);
            await raw_mode.end();
        });
    }
}

export default DeviceFiles;