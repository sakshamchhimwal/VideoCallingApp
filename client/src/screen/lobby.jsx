import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/socketProvider";
import { useNavigate } from "react-router-dom";

const Lobby = () => {
    const socket = useSocket();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [room, setRoom] = useState("");
    const handleSubmitForm = useCallback(
        (e) => {
            e.preventDefault();
            // console.log({ email, room });
            socket.emit("room:join", { email, room });
        },
        [socket, email, room]
    );

    const handleRoomJoin = useCallback((data) => {
        // console.log(data.email);
        navigate(`/room/${data.room}`);
    }, []);

    useEffect(() => {
        socket.on("room:join", handleRoomJoin);
        return () => {
            socket.off("room:join", handleRoomJoin);
        };
    }, [socket, handleRoomJoin]);

    return (
        <div>
            <h1>Lobby</h1>
            <form onSubmit={handleSubmitForm}>
                <label htmlFor="email">Email ID</label>
                <input
                    type="text"
                    id="email"
                    htmlFor="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <br />
                <label htmlFor="room">Room Number</label>
                <input
                    type="text"
                    id="email"
                    htmlFor="room"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                />
                <br />
                <button type="submit">Join</button>
            </form>
        </div>
    );
};

export default Lobby;
