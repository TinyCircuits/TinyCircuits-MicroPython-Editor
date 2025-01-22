import { WebSerial } from 'ViperIDE/src/transports.js'

class WebSerialOverride extends WebSerial{

    constructor(setIsSerialConnected){
        super();
        this.setIsSerialConnected = setIsSerialConnected;
    }

    async delay(ms){
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }

    // Override this function from ViperIDE
    // since it shows all connected devices
    // when we only want to show Thumby Color
    // RP2350 devices
    async requestAccess(filters){
        super.port = await this.serial.requestPort({ filters });
        
        try{
            const pi = super.port.getInfo()
            this.info = {
                vid: pi.usbVendorId.toString(16).padStart(4, '0'),
                pid: pi.usbProductId.toString(16).padStart(4, '0'),
            }
        }catch(err){
            console.error(err);
        }
    }

    connected(){
        if(super.port && super.port.readable && super.port.writable){
            return true;
        }else{
            return false;
        }
    }

    async connect(filters){
        if(this.connected()){
            return;
        }

        const ports = await navigator.serial.getPorts({ filters });
        if (ports.length > 0) {
            super.port = ports[0];
            console.log('Connecting to previously paired device...');
        } else {
            await this.requestAccess(filters);
            console.log('Connecting to selected device...');
        }

        await super.connect();
        this.setIsSerialConnected(true);
        this.port.addEventListener('disconnect', this.disconnect.bind(this));
    }


    async disconnect(){
        console.log("Disconnecting...");

        if (this.reader) {
            await this.reader.releaseLock();
        }
        if (this.writer) {
            await this.writer.releaseLock();
        }
        if (this.port) {
            await this.port.close();
        }
        this.port = null;
        this.reader = null;
        this.writer = null;
        
        this.setIsSerialConnected(false);
    }

    async write(data){
        if(this.writer != undefined && this.writer != null){
            await super.write(data);
        }
    }

    // Call this to get the device back into a soft
    // rebooted mode
    async reset(){
        console.log("reset: Starting transaction...");
        let endTransaction = await this.startTransaction();
        console.log("reset: Transaction started!");

        await this.write("\x03");   // Interrupt any program

        try{
            await this.readUntil(">", 500)
        }catch(ex){
            console.warn(ex);
        }

        try{
            await this.readUntil(">>>", 500)
        }catch(ex){
            console.warn(ex);
        }

        await this.write("\x02");   // Exit raw mode if in it
        await this.readUntil(">>>", 850);

        await this.write("\x04");   // Soft reboot
        await this.readUntil("Engine", 850);

        await this.write("\x03");   // Interrupt main
        // await this.readUntil(">>>", 850);

        endTransaction();
    }
}

export default WebSerialOverride;