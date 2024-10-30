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
        
        this.setIsSerialConnected(false);
    }

    async write(data){
        if(this.writer != undefined && this.writer != null){
            await super.write(data);
        }
    }
}

export default WebSerialOverride;