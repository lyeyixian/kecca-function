const functions = require("firebase-functions");

// Express
const app = require("express")();

// Auth
const { fbAuthUser, fbAuthAdmin } = require("./util/fbAuth");

// Handlers
const { getAllEvents, createOneEvent } = require("./handlers/events");
const { signup, login, setCurrentUserAsAdmin } = require("./handlers/users");
const { createCCA, getAllMembers } = require("./handlers/admin");

// Event route
app.get("/events", getAllEvents);

// Admin route
app.post("/event", fbAuthAdmin, createOneEvent);
app.post("/cca", fbAuthAdmin, createCCA);
app.get("/members", fbAuthAdmin, getAllMembers);

// User route
app.post("/signup", signup);
app.post("/login", login);
app.post("/admin", fbAuthUser, setCurrentUserAsAdmin);

// Test
// app.put("/test", FBAuth, setCurrentUserAsAdmin);

exports.api = functions.region("asia-east2").https.onRequest(app);
