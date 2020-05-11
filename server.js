require("dotenv").config();

const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");

const app = express();
const path = require("path");
const AccessToken = require("twilio").jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

const MAX_ALLOWED_SESSION_DURATION = 1800;
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioApiKeySID = process.env.TWILIO_API_KEY_SID;
const twilioApiKeySecret = process.env.TWILIO_API_KEY_SECRET;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/video/token", (req, res) => {
  request({ url: "https://localhost:8081" }, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      return res.status(500).json({ type: "error", message: error.message });
    }

    res.json(JSON.parse(body));
  });
});

const sendTokenResponse = (token, res) => {
  res.set("Content-Type", "application/json");
  res.send(
    JSON.stringify({
      token: token.toJwt(),
    })
  );
};

const generateToken = (config) => {
  return new AccessToken(
    config.twilio.twilioAccountSid,
    config.twilio.twilioApiKeySID,
    config.twilio.twilioApiKeySecret
  );
};

const videoToken = (identity, room, config) => {
  let videoGrant;
  if (typeof room !== "undefined") {
    videoGrant = new VideoGrant({ room });
  } else {
    videoGrant = new VideoGrant();
  }
  const token = generateToken(config);
  token.addGrant(videoGrant);
  token.identity = identity;
  return token;
};

app.use(express.static(path.join(__dirname, "build")));

app.get("/token", (req, res) => {
  const { identity, roomName } = req.query;
  const token = new AccessToken(
    twilioAccountSid,
    twilioApiKeySID,
    twilioApiKeySecret,
    {
      ttl: MAX_ALLOWED_SESSION_DURATION,
    }
  );
  token.identity = identity;
  const videoGrant = new VideoGrant({ room: roomName });
  token.addGrant(videoGrant);
  res.send(token.toJwt());
  console.log(`issued token for ${identity} in room ${roomName}`);
});

app.get("/video/token", (req, res) => {
  const identity = req.query.identity;
  const room = req.query.room;
  const token = videoToken(identity, room, {
    twilio: { twilioAccountSid, twilioApiKeySID, twilioApiKeySecret },
  });
  sendTokenResponse(token, res);
});

app.post("/video/token", (req, res) => {
  console.log("What is req", req.body);
  const identity = req.body.identity;
  const room = req.body.room;
  const token = videoToken(identity, room, {
    twilio: { twilioAccountSid, twilioApiKeySID, twilioApiKeySecret },
  });
  sendTokenResponse(token, res);
});

app.get("*", (_, res) =>
  res.sendFile(path.join(__dirname, "build/index.html"))
);

app.listen(8081, () => console.log("token server running on 8081"));
