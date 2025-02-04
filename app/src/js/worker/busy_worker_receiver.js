import BusyWorkerBase from "./busy_worker_base.js";
import BusyWorkerBufferChannel from "./busy_worker_buffer_channel.js";
import dbgconsole from "../dbgconsole.js";


// Use this on the worker
export default class BusyWorkerReceiver extends BusyWorkerBase{
    constructor(){
        // Setup base class
        super();
        super.setup(self, this.postReceive);

        dbgconsole("BusyWorkerReceiver: created");

        // Send message to main thread indicating ready for work
        this.tellReady();
    }


    // Post "READY" `message_type` to main thread to
    // let it know this worker is ready for messages
    tellReady(){
        this.post(this.POST_MESSAGE_TYPE_READY);
    }

    
    postReceive(messageType, channelName, value){
        dbgconsole("Sender: received post message", messageType, channelName, value);

        if(messageType == this.POST_MESSAGE_TYPE_SETUP){
            this.registerBufferChannel(channelName, value, undefined);
        }
    }


    registerBufferChannel(channelName, sharedBuffer, onReceiveCB){
        if(this.channels[channelName] == undefined){
            this.channels[channelName] = new BusyWorkerBufferChannel(sharedBuffer, onReceiveCB);
        }else{
            if(this.channels[channelName].sharedBuffer == undefined){
                this.channels[channelName].setBuffer(sharedBuffer);
            }

            if(this.channels[channelName].onReceiveCB == undefined){
                this.channels[channelName].onReceiveCB = onReceiveCB;
            }
        }
    }


    check(channelName, reset=true){
        let channel = this.channels[channelName];

        if(channel.view.getUint8(0) == 1){
            if(reset) channel.view.setUint8(0, 0);    // Reset
            return channel.onReceiveCB();
        }
    }
}