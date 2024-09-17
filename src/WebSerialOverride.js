import { WebSerial } from 'ViperIDE/src/transports.js'

class WebSerialOverride extends WebSerial{

    // Override this function from ViperIDE
    // since it shows all connected devices
    // when we only want to show Thumby Color
    // RP2350 devices
    async requestAccess(vendorID, productID){
        this.port = await this.serial.requestPort({filters: [{usbVendorId: vendorID, usbProductID: productID}]})

        try {
            const pi = this.port.getInfo()
            this.info = {
                vid: pi.usbVendorId.toString(16).padStart(4, '0'),
                pid: pi.usbProductId.toString(16).padStart(4, '0'),
            }
        } catch(err) {}
    }
}

export default WebSerialOverride;