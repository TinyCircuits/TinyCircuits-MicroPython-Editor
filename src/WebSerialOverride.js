import { WebSerial } from 'ViperIDE/src/transports.js'

class WebSerialOverride extends WebSerial{

    constructor(setIsSerialConnected){
        super();
        this.setIsSerialConnected = setIsSerialConnected;
    }

    // Override this function from ViperIDE
    // since it shows all connected devices
    // when we only want to show Thumby Color
    // RP2350 devices
    async requestAccess(vendorID, productID){
        this.port = await this.serial.requestPort({filters: [{usbVendorId: vendorID, usbProductID: productID}]});
        this.setIsSerialConnected(true);

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
        await super.disconnect();
        this.setIsSerialConnected(false);
    }
}

export default WebSerialOverride;