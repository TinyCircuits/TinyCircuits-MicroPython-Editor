class Serial{
    constructor(vendorProductIDs){
        this.vendorProductIDs = vendorProductIDs;

        this.serial = undefined;

        navigator.serial.addEventListener('connect', (event) => {
            console.log("Detected serial device");
            this.attemptAutoConnect();
        });

        
        navigator.serial.addEventListener('disconnect', (event) => {
            console.log("Detected disconnection of serial device");
            this.#disconnect();
        });

        // Encode to bytes when writing
        this.encoder = new TextEncoder(); 

        this.manuallyConnecting = false;
        this.connected = false;

        // Functions called internally but defined externally
        this.onConnect = () => {};
        this.onDisconnect = () => {};
        this.onData = (data) => {};
    }


    async #readLoop(){
        this.reader = undefined;
        this.writer = await this.port.writable.getWriter();
        // await this.writer.write(this.encoder.encode("\r\x02"));

        // Loop to keep the reading loop going every time it ends due to done status
        while(this.port.readable && this.connected){

            // Get the reader if it is not locked
            if(!this.port.readable.locked){
                this.reader = this.port.readable.getReader();
            }

            try{
                while(true){
                    const { value, done } = await this.reader.read();

                    // If done, allow reader to be closed and break loop
                    if(done){
                        this.reader.releaseLock();
                        break;
                    }

                    // If data defined, stream it to onData
                    if(value){
                        this.onData(value);
                    }
                }
            }catch(error){
                // Likely unplugged
            }
        }
    }


    async #disconnect(){
        if(this.connected){
            this.reader.releaseLock();
            this.writer.releaseLock();
            this.port.close();

            this.reader = undefined;
            this.writer = undefined;
            this.port = undefined;

            this.connected = false;
            this.onDisconnect();
        }
    }


    async #connect(port){
        window.load(90, "Opening port...");

        try{
            await port.open({ baudRate: 115200 });
            this.port = port;

            this.connected = true;
            this.#readLoop();
            this.onConnect();

            window.load(100, "Connected!");
        }catch(error){
            if(error.name == "InvalidStateError"){
                window.showError("Port already open...");
                window.load(0, "Port already open...");
            }else if(error.name == "NetworkError"){
                window.showError("Failed to open port, is something using it?");
                window.load(0, "Failed to open port, is something using it?");
            }
        }
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
            }catch(error){
                // User did not select anything and closed browser dialog
                window.load(0, "No device selected for connection...");
            }
            this.manuallyConnecting = false;
        }
    }
}

export { Serial }