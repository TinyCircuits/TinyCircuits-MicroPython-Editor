export default class BusyWorkerBufferChannel{
    constructor(sharedBuffer, onReceiveCB){
        this.onReceiveCB = onReceiveCB;
        this.setBuffer(sharedBuffer);
    }

    setBuffer(sharedBuffer){
        if(sharedBuffer != undefined){
            this.sharedBuffer = sharedBuffer;
            this.u8data = new Uint8Array(this.sharedBuffer, 1, this.sharedBuffer.byteLength-1);
            this.view = new DataView(this.sharedBuffer);
        }
    }
}