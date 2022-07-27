class Multiplayer{
    constructor(mcu){
        this.mcu = mcu;
        this.btnMP = document.getElementById("btnMP");

        // https://stackoverflow.com/questions/54980799/webrtc-datachannel-with-manual-signaling-example-please/54985729#54985729
        this.config = {iceServers: [{urls: "stun:stun.1.google.com:19302"}]};
        this.connection = new RTCPeerConnection(this.MULTIPLAYER_CONFIG);
        this.channel = this.connection.createDataChannel("chat", {negotiated: true, id: 0});

        this.btnMP.onclick = async (event) => {
            if(await confirm("Host or no?")){
                await this.connection.setLocalDescription(await this.connection.createOffer());
                this.connection.onicecandidate = async ({candidate}) => {
                    if (candidate) return;
                    navigator.clipboard.writeText(btoa(this.connection.localDescription.sdp));
                    let answer = await prompt("An offer string was copied to your clipboard, use this in the other window. Copy the other window's answer here");
                    this.connection.setRemoteDescription({type: "answer", sdp: atob(answer)});
                };
            }else{
                let offer = await prompt("Copy the other window's offer here");

                await this.connection.setRemoteDescription({type: "offer", sdp: atob(offer)});
                await this.connection.setLocalDescription(await this.connection.createAnswer());
                this.connection.onicecandidate = ({candidate}) => {
                    if (candidate) return;
                    navigator.clipboard.writeText(btoa(this.connection.localDescription.sdp));
                    alert("An answer string was copied to your clipboard, use it in the other window");
                };
            }
        };


        this.channel.onopen = () => {
            // When the emulator changes the gpio state, let the other one know about it
            this.mcu.gpio[0].addListener(() => {
                console.log(this.mcu.gpio[0].value);
                this.channel.send(this.mcu.gpio[0].value);
                this.mcu.gpio[1].setInputValue(this.mcu.gpio[0].value);
            });

            this.channel.onmessage = (event) => {
                console.log(event.data);
                if(parseInt(event.data) > 0){
                    this.mcu.gpio[1].setInputValue(true);
                }else if(parseInt(event.data) == 0){
                    this.mcu.gpio[1].setInputValue(false);
                }
            }
        }
    }
}

export { Multiplayer }