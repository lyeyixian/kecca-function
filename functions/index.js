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
  getUserDetails,
} = require("./handlers/users");
const {
  createCCA,
  getAllMembers,
  getAllCCA,
  getPendingRequest,
} = require("./handlers/admin");

// Event route
app.get("/events", getAllEvents);
app.post("/event", fbAuthAdmin, createOneEvent);
app.get("/event/user", fbAuthUser, getParticipatedEvents);
app.get("/event/cca", fbAuthAdmin, getOrganisedEvents);
// app.post("/event/attendance", fbAuthAdmin); // TODO

// CCA route
app.post("/cca", fbAuthAdmin, createCCA);
app.get("/cca", getAllCCA);
app.get("/cca/members", fbAuthAdmin, getAllMembers);
app.get("/cca/request", fbAuthAdmin, getPendingRequest);

// User route
app.post("/signup", signup);
app.post("/login", login);
app.get("/user", fbAuthUser, getUserDetails);
app.post("/user/admin", fbAuthUser, setCurrentUserAsAdmin);
app.post("/user/join", fbAuthUser, join);

// Test
// app.put("/test", FBAuth, setCurrentUserAsAdmin);

exports.api = functions.region("asia-east2").https.onRequest(app);

// TODO:
// admin accept request
// admin decline request
// admin take attendance
// get target user detail

// Trigger:
// when accept request in cca update in user detail (ccaParticipated)
// update adminStatus or cca admin property
