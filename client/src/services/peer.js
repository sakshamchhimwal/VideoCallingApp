class PeerService {
    constructor() {
        if (!this.peer) {
            this.peer = new RTCPeerConnection({
                iceServers: [{
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:global.stun.twilio.com:3478",
                    ],
                }]
            })
        }
    }

    getAns = async (offer) => {
        if (this.peer) {
            await this.peer.setRemoteDescription(offer);
            const ans = await this.peer.createAnswer();
            await this.peer.setLocalDescription(new RTCSessionDescription(ans));
            return ans;
        }
    }

    getOffer = async () => {
        if (this.peer) {
            const offer = await this.peer.createOffer();
            this.peer.setLocalDescription(new RTCSessionDescription(offer));
            return offer;
        }
    }

    async setLocalDescription(ans) {
        if (this.peer) {
            console.log(ans);
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
        }
    }
}

export default new PeerService();