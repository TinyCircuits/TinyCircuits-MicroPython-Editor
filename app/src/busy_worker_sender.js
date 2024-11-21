import BusyWorkerBase from "./busy_worker_base";
import BusyWorkerBufferChannel from "./busy_worker_buffer_channel";
import dbgconsole from "./dbgconsole";


// Use this on the main thread to setup the receiver worker
export default class BusyWorkerSender extends BusyWorkerBase{
    constructor(workerScriptPath, workerReadyCB = () => {}){
        // Setup base class
        super();
        super.setup(new Worker(workerScriptPath, { type: "module" }), this.postReceive);

        // For restarting
        this.workerScriptPath = workerScriptPath;

        // Called on main thread once worker is ready
        this.workerReadyCB = workerReadyCB;

        dbgconsole("BusyWorkerSender: created");
    }


    postReceive(messageType, channelName, value){
        dbgconsole("Sender: received post message", messageType, channelName, value);

        // Special case that worker replies with once setup initially
        if(messageType == this.POST_MESSAGE_TYPE_READY){
            this.workerReady = true;
            this.workerReadyCB();
            return;
        }
    }


    registerBufferChannel(channelName, sharedBufferLength, onReceiveCB){
        this.channels[channelName] = new BusyWorkerBufferChannel(new SharedArrayBuffer(1+sharedBufferLength), onReceiveCB);
        this.post(this.POST_MESSAGE_TYPE_SETUP, channelName, this.channels[channelName].sharedBuffer);
    }


    restart(){
        this.worker.terminate();
        super.setup(new Worker(this.workerScriptPath, { type: "module" }), this.postReceive);
    }
}