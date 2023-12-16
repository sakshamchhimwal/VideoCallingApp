import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/socketProvider";
import peer from "../services/peer.js";
import ReactPlayer from "react-player";

const RoomPage = () => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    const handleJoin = useCallback((data) => {
        console.log(`Email: ${data.email} joined.`);
        setRemoteSocketId(data.id);
    }, []);

    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        const offer = await peer.getOffer();
        socket.emit("user:call", { to: remoteSocketId, offer });
        setMyStream(stream);
    }, [remoteSocketId, socket]);

    const handleIncomingCall = useCallback(
        async ({ from, offer }) => {
            setRemoteSocketId(from);
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });
            setMyStream(stream);
            console.log(`Incoming call from ${from}`);
            console.log(offer);
            const ans = await peer.getAns(offer);
            socket.emit("call:accepted", { to: from, ans });
        },
        [socket]
    );

    const sendStreams = useCallback(() => {
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream);
        }
    }, [myStream]);

    const handleCallAccepted = useCallback(
        ({ from, ans }) => {
            // console.log(ans);
            peer.setLocalDescription(ans);
            console.log("Call Accpeted");
            sendStreams();
        },
        [sendStreams]
    );

    const handleAddStream = useCallback(async (ev) => {
        const remoteStream = ev.streams;
        setRemoteStream(remoteStream[0]);
    }, []);

    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
    }, [remoteSocketId, socket]);

    const handleNegoIncoming = useCallback(
        async ({ from, offer }) => {
            console.log(offer);
            const ans = await peer.getAns(offer);
            socket.emit("peer:nego:done", { to: from, ans });
        },
        [socket]
    );

    const handleNegoFinal = useCallback(async ({ from, ans }) => {
        await peer.setLocalDescription(ans);
    }, []);

    useEffect(() => {
        peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
        return () => {
            peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
        };
    }, [handleNegoNeeded]);

    useEffect(() => {
        peer.peer.addEventListener("track", handleAddStream);
        return () => {
            peer.peer.removeEventListener("track", handleAddStream);
        };
    });

    useEffect(() => {
        socket.on("user:joined", handleJoin);
        socket.on("incoming:call", handleIncomingCall);
        socket.on("call:accepted", handleCallAccepted);
        socket.on("peer:nego:needed", handleNegoIncoming);
        socket.on("peer:nego:final", handleNegoFinal);
        return () => {
            socket.off("user:joined", handleJoin);
            socket.off("incoming:call", handleIncomingCall);
            socket.off("call:accepted", handleCallAccepted);
            socket.off("peer:nego:needed", handleNegoIncoming);
            socket.off("peer:nego:final", handleNegoFinal);
        };
    }, [
        handleCallAccepted,
        handleIncomingCall,
        handleJoin,
        handleNegoFinal,
        handleNegoIncoming,
        socket,
    ]);

    return (
        <div>
            <h1>Room Page</h1>
            <h4>{remoteSocketId ? `Connected ${remoteSocketId}` : "No one else"}</h4>
            {remoteSocketId && (
                <button
                    onClick={() => {
                        handleCallUser();
                    }}
                >
                    Call
                </button>
            )}
            {myStream && <button onClick={sendStreams}>Send Stream</button>}
            {myStream && (
                <>
                    <h1>My Stream</h1>
                    <ReactPlayer
                        height={300}
                        width={300}
                        playing={true}
                        muted={true}
                        url={myStream}
                    />
                </>
            )}
            {remoteStream && (
                <>
                    <h1>Remote Stream</h1>
                    <ReactPlayer
                        height={300}
                        width={300}
                        playing={true}
                        muted={true}
                        url={remoteStream}
                    />
                </>
            )}
        </div>
    );
};

export default RoomPage;
