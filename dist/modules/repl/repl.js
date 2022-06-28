class Repl{
    constructor(vendorProductIDs){
        this.vendorProductIDs = vendorProductIDs;

        this.serial = undefined;

        navigator.serial.addEventListener('connect', (event) => {
            console.log("Detected serial device");
            this.attemptAutoConnect();
        });

        
        navigator.serial.addEventListener('disconnect', (event) => {
            console.log("Detected disconnection of serial device");
        });

        this.manuallyConnecting = false;
        this.connected = false;
    }


    async #connect(port){
        window.load(100, "Connected!");
        console.log(port);
    }


    async attemptAutoConnect(){
        if(this.manuallyConnecting == false){
            window.load(25, "Attempting auto connect...");
            // Get ports this page knows about
            let ports = await navigator.serial.getPorts();

            // For each port, check if it matches any of the passed VID and PID pairs then finish connecting or return false
            for(let portidx=0; portidx<ports.length; portidx++){
                for(let pairidx=0; pairidx<this.vendorProductIDs.length; pairidx++){
                    let portInfo = ports[portidx].getInfo();
                    if(portInfo.usbVendorId == this.vendorProductIDs[pairidx].usbVendorId && portInfo.usbProductId == this.vendorProductIDs[pairidx].usbProductId){
                        this.#connect(ports[portidx]);
                        return true;
                    }
                }
            }
        }
        return false;
    }


    async connect(){
        // If auto connect fails, continue to manual selection
        if(await this.attemptAutoConnect() == false){
            this.manuallyConnecting = true;
            try{
                window.load(50, "Waiting on device selection...");
                let port = await navigator.serial.requestPort({filters: this.vendorProductIDs});
                this.#connect(port);
            }catch(DOMException){
                // User did not select anything and closed browser dialog
                window.load(0, "No device selected for connection...");
            }
            this.manuallyConnecting = false;
        }
    }
}

export { Repl }