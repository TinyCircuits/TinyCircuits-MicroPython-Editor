import dbgconsole from "./dbgconsole";

// Common interface that BusyWorkerSender and BusyWorkerReceiver
// both use
export default class BusyWorkerBase{
    constructor(){
        // When posting messages to/from main/worker, only two types
        this.POST_MESSAGE_TYPE_READY = "READY";     // Worker ready
        this.POST_MESSAGE_TYPE_SETUP = "SETUP";     // Setup shared buffer
        this.POST_MESSAGE_TYPE_PACKET = "PACKET";   // Feed to receive channel receive callback
        this.POST_MESSAGE_TYPE_CHECK = "CHECK";     // When the worker is not runnign code that checks the channels, this needs to be sent to make it
        this.POST_MESSAGE_TYPE_STALLED = "STALLED"; // Message type sent to main thread when worker calls tick function

        // ID of stall detector tiemout
        this.stalledTimeoutID = undefined;
    }


    setup(worker, postReceiveCB){
        // Registered buffer channels are stored here
        this.channels = {};
        
        // Flag indicating that the worker is doing work that stalls it
        this.workerStalled = false;

        // Setup worker
        this.worker = worker;
        this.worker.onmessage = this.basePostReceive.bind(this); 
        this.worker.onmessageerror = (message) => {console.error(message)};
    
        // When a message is received from the worker,
        // this is called after this class gets a chance
        // to deconstruct it
        this.postReceiveCB = postReceiveCB;
    }


    // Formatted `postMessage`: {messageType, channelName, value}
    post(messageType, channelName, value){
        dbgconsole("Posting message...");
        this.worker.postMessage({messageType:messageType,
                                 channelName:channelName,
                                 value:value});
    }


    send(channelName, value, onReceiveCB){
        if(onReceiveCB != undefined){
            this.channels[channelName].onReceiveCB = onReceiveCB;
        }

        this.worker.postMessage({messageType:this.POST_MESSAGE_TYPE_PACKET,
                                 channelName:channelName,
                                 value:value});
    }


    // message = {message_type, channel_name, value}
    basePostReceive(message){
        // Deconstruct message into variables
        let msgMessageType = message.data.messageType;
        let msgChannelName = message.data.channelName;
        let msgValue       = message.data.value;

        dbgconsole("Base: received post message", msgMessageType, msgChannelName, msgValue);

        // If packet message, find channel, otherwise send to lower post receive handler
        if(msgMessageType == this.POST_MESSAGE_TYPE_PACKET || msgMessageType == this.POST_MESSAGE_TYPE_CHECK){
            this.channels[msgChannelName].onReceiveCB(msgValue);
        }else if(msgMessageType == this.POST_MESSAGE_TYPE_STALLED){
            // Indicates that worker is running code that won't allow postMessage
            // to be received but it will be checking buffers
            this.workerStalled = true;

            // Cancel last timeout
            if(this.stalledTimeoutID != undefined){
                clearTimeout(this.stalledTimeoutID);   
            }

            // Start a new timeout that will reset flag so that communcation is done over postMessage again
            this.stalledTimeoutID = setTimeout(() => {
                dbgconsole("Haven't received stalled heartbeat from worker, timeout");
                this.workerStalled = false;
                this.stalledTimeoutID = undefined;
            }, 1000);
        }else{
            // Call the callback that was passed in constructor
            this.postReceiveCB(msgMessageType, msgChannelName, msgValue);
        }
    }


    setu8(channelName, byteOffset, value){
        this.channels[channelName].view.setUint8(1+byteOffset, value);
    }

    getu8(channelName, byteOffset){
        return this.channels[channelName].view.getUint8(1+byteOffset);
    }

    setu16(channelName, byteOffset, value){
        this.channels[channelName].view.setUint16(1+byteOffset, value);
    }

    getu16(channelName, byteOffset){
        return this.channels[channelName].view.getUint16(1+byteOffset);
    }

    getu8Data(channelName){
        return this.channels[channelName].u8data;
    }


    mark(channelName, onReceiveCB){
        dbgconsole("Base: marking channel for send:", channelName);

        if(onReceiveCB != undefined){
            this.channels[channelName].onReceiveCB = onReceiveCB;
        }

        this.channels[channelName].view.setUint8(0, 1);

        if(this.workerStalled == false) this.post(this.POST_MESSAGE_TYPE_CHECK, channelName, undefined);
    }


    clear(channelName){
        dbgconsole("Base: clearing channel for send", channelName);
        this.channels[channelName].view.setUint8(0, 0);
    }
}