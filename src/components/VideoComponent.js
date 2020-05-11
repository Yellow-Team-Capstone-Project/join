import React, { useState, useEffect, useCallback } from 'react';
import Video from 'twilio-video';
import axios from 'axios';
import { Lobby } from '.';


const VideoComponent = (props) => {
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('');
  const [token, setToken] = useState(null);

  const handleUsernameChange = useCallback((event) => {
    setUsername(event.target.value);
  }, []);

  const handleRoomNameChange = useCallback((event) => {
    setRoomName(event.target.value);
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      try{
        event.preventDefault();
        console.log({username,
          roomName})
        const { data } = await axios.post('http://localhost:8081/video/token', {
         data: {identity: username,
          room: roomName},
        });
        
        setToken(data.token);

      } catch(error) {
        console.log("Oops I did it again", error)
      }
    },
    [username, roomName]
  );

  const handleLogout = useCallback((event) => {
    setToken(null);
  }, []);

  let render;
  if (token) {
    render = (
      <div>
        <p>Username: {username}</p>
        <p>Room name: {roomName}</p>
        <p>Token: {token}</p>
      </div>
    );
  } else {
    render = (
      <Lobby
        username={username}
        roomName={roomName}
        handleUsernameChange={handleUsernameChange}
        handleRoomNameChange={handleRoomNameChange}
        handleSubmit={handleSubmit}
      />
    );
  }
  return render;
};

export default VideoComponent;
