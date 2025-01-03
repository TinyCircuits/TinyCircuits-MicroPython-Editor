
let sharedBuffers = [new SharedArrayBuffer(128*4), new SharedArrayBuffer(128*4)];
let floatBuffers = [new Float32Array(sharedBuffers[0]), new Float32Array(sharedBuffers[1])];
let readingBufferIndex = 0;

class AudioProessor extends AudioWorkletProcessor{
    process(inputs, outputs, parameters){
        const output = outputs[0];
        output.forEach((channel) => {
            for (let i = 0; i < channel.length; i++) {
                // channel[i] = floatBuffers[readingBufferIndex][i];
            }
        });

        // Flip between 0 and 1
        readingBufferIndex = !readingBufferIndex;

        console.log(readingBufferIndex);

        // const output = outputs[0];
        // output.forEach((channel) => {
        //     for (let i = 0; i < channel.length; i++) {
        //         channel[i] = Math.random() * 2 - 1;
        //     }
        // });
        return true;
    }
}

registerProcessor("audio-processor", AudioProessor);
  