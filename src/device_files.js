import { MpRawMode } from 'ViperIDE/src/rawmode';

class DeviceFiles{
    constructor(serial, setTree){
        this.dir_handle = undefined;
        this.serial = serial;
        this.tree = undefined;
        this.setTree = setTree;
    }

    // Call this to open file directory chooser on computer
    open_files = () => {
        // console.log(this.serial);

        // console.log(this.mp_raw_mode);

        MpRawMode.begin(this.serial).then(async (raw_mode) => {
            console.log(raw_mode);
            console.log(await raw_mode.getDeviceInfo());

            this.tree = await raw_mode.walkFs();
            this.setTree(this.tree);
        });
    }
}

export default DeviceFiles;