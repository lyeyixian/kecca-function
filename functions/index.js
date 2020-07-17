const functions = require("firebase-functions");

// Express
const app = require("express")();

// Auth
const { fbAuthUser, fbAuthAdmin } = require("./util/fbAuth");

// Handlers
const {
  getAllEvents,
  createOneEvent,
  getParticipatedEvents,
  getOrganisedEvents,
} = require("./handlers/events");
const {
  signup,
  login,
  setCurrentUserAsAdmin,
  join,
} = require("./handlers/users");
const { createCCA, getAllMembers } = require("./handlers/admin");

// Event route
app.get("/events", getAllEvents);
app.post("/event", fbAuthAdmin, createOneEvent);
app.get("/event/user", fbAuthUser, getParticipatedEvents);
app.get("/event/cca", fbAuthAdmin, getOrganisedEvents);
app.post("/event/attendance", fbAuthAdmin); // TODO

// CCA route
app.post("/cca", fbAuthAdmin, createCCA);
app.get("/cca/members", fbAuthAdmin, getAllMembers);

// User route
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/admin", fbAuthUser, setCurrentUserAsAdmin);
app.post("/user/join", fbAuthUser, join);

// Test
// app.put("/test", FBAuth, setCurrentUserAsAdmin);

exports.api = functions.region("asia-east2").https.onRequest(app);

// TODO:
// admin accept request
// admin take attendance
// get all CCAs
// get user details
