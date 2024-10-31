import { WebSerial } from 'ViperIDE/src/transports.js'

class WebSerialOverride extends WebSerial{

    constructor(setIsSerialConnected){
        super();
        this.setIsSerialConnected = setIsSerialConnected;
        
        // Flag that is managed at this layer to prevent
        // disconnect callback from calling `disconnect()`
        // after already called
        this.disconnected = true;
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
    async requestAccess(vendorID, productID){
        this.port = await this.serial.requestPort({filters: [{usbVendorId: vendorID, usbProductID: productID}]});
        this.setIsSerialConnected(true);

        // Not disconnected anymore, set
        this.disconnected = false;

        try{
            const pi = this.port.getInfo()
            this.info = {
                vid: pi.usbVendorId.toString(16).padStart(4, '0'),
                pid: pi.usbProductId.toString(16).padStart(4, '0'),
            }
        }catch(err){
            console.error(err);
        }
    }

    async disconnect(){
        // Don't do anything if already disconnected
        if(this.disconnected){
            return;
        }

        // Now disconnected
        this.disconnected = true;

        try{
            await this.reader.releaseLock();
            await this.writer.releaseLock();
        }catch(error){
            console.error(error);
        }

        await this.port.close();

        this.reader = null;
        this.writer = null;
        this.port = null;
        
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
        let endTransaction = await this.startTransaction();

        await this.write("\x03");   // Interrupt any program
        if(await this.readUntil(">", 500) == undefined){
            await this.readUntil(">>>", 500);
        }

        await this.write("\x02");   // Exit raw mode if in it
        await this.readUntil(">>>", 3000);

        await this.write("\x04");   // Soft reboot
        await this.readUntil("Engine", 500);

        await this.write("\x03");   // Interrupt main
        await this.readUntil(">>>", 500);

        endTransaction();
    }
}

export default WebSerialOverride;