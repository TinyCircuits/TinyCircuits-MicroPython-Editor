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

    // #port;  // WebSerial port
    // #reader;
    // #writer;

    // constructor(){
    //     this.#port = undefined;    
    //     this.#reader = undefined;
    //     this.#writer = undefined;

    //     navigator.serial.addEventListener("connect", this.#onConnect);
    //     navigator.serial.addEventListener("disconnect", this.#onDisconnect);
    // }

    // #onConnect = (event) => {
    //     console.log(event);
    // }

    // #onDisconnect = (event) => {
    //     console.log(event);
    //     this.disconnect();
    // }

    // #openPort = async () => {
    //     return new Promise((resolve, reject) => {
    //         this.#port.open({ baudRate: 115200}).then((result) => {
    //             // Port open successfully, get reader and writer streams
    //             this.#reader = this.#port.readable.getReader(); // https://developer.mozilla.org/en-US/docs/Web/API/SerialPort#reading_data_from_a_port
    //             this.#writer = this.#port.writable.getWriter(); // https://developer.mozilla.org/en-US/docs/Web/API/SerialPort#writing_data_to_a_port

    //             console.log(this.#port)

    //             // this.#writer.write(new TextEncoder().encode('\x03'))

    //             resolve();
    //         }).catch((error) => {
    //             if(error.name == "InvalidStateError"){
    //                 reject(new Error("Port already open, do you have tab or program using it?"));
    //             }else if(error.name == "NetworkError"){
    //                 reject(new Error("Failed to open port for unknown reason. Could be because it is already open in another tab or program."));
    //             }else{
    //                 reject(error);
    //             }
    //         });
    //     });
    // }

    // connect = async (vendorID, productID) => {
    //     return new Promise((resolve, reject) => {
    //         if(navigator.serial == undefined){
    //             reject(new Error("This browser does not support Web Serial. Please use a Chromium based browser like Google Chrome or Microsoft Edge"));
    //         }

    //         navigator.serial.requestPort({filters: [{usbVendorId: vendorID, usbProductID: productID}]}).then((port) => {
    //             this.#port = port;
    //             resolve();
    //         }).catch((error) => {
    //             reject(error);
    //         })
    //     }).then((result) => {
    //         return this.#openPort();
    //     })
    // }

    // disconnect = async () => {
    //     // https://stackoverflow.com/a/71263127
    //     if(this.#reader != undefined){
    //         await this.#reader.cancel();
    //         this.#reader.releaseLock();
    //     }

    //     if(this.#writer != undefined){
    //         this.#writer.releaseLock();
    //     }

    //     if(this.#port != undefined){
    //         this.#port.close();
    //     }
    // }
}

export default WebSerialOverride;