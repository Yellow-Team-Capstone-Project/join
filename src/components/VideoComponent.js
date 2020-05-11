import React, { useState, useEffect, useCallback } from "react";
import Video from "twilio-video";
import axios from "axios";

const VideoComponent = (props) => {
  const [username, setUsername] = useState("");
  const [roomName, setRoomName] = useState("");
  const [token, setToken] = useState(null);

  const handleUsernameChange = useCallback((event) => {
    setUsername(event.target.value);
  }, []);
  const handleRoomNameChange = useCallback((event) => {
    setRoomName(event.target.value);
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const { data } = await axios.post("/video/token");
      setToken(data.token);
    },
    [username, roomName]
  );
  const handleLogout = useCallback((event) => {
    setToken(null);
  }, []);

  return <div>Video Component</div>;
};

export default VideoComponent;
