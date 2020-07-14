const functions = require("firebase-functions");

// Express
const app = require("express")();

// Auth
const FBAuth = require("./util/fbAuth");

// Handlers
const { getAllEvents, createOneEvent } = require("./handlers/events");
const { signup, login } = require("./handlers/users");

// Event route
app.get("/events", getAllEvents);
app.post("/event", FBAuth, createOneEvent);

// User route
app.post("/signup", signup);
app.post("/login", login);

exports.api = functions.region("asia-east2").https.onRequest(app);
