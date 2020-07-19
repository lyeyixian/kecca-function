const functions = require("firebase-functions");

// Express
const app = require("express")();

// Auth
const { fbAuthUser, fbAuthAdmin } = require("./util/fbAuth");

const { db } = require("./util/admin");
// Handlers
const {
  getAllEvents,
  createOneEvent,
  getParticipatedEvents,
  getOrganisedEvents,
  takeAttendance,
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
  acceptRequest,
  declineRequest,
} = require("./handlers/admin");

// Event route
app.get("/events", getAllEvents);
app.post("/event", fbAuthAdmin, createOneEvent);
app.get("/event/user", fbAuthUser, getParticipatedEvents);
app.get("/event/cca", fbAuthAdmin, getOrganisedEvents);
app.post("/event/:eventId/attendance", fbAuthAdmin, takeAttendance);

// CCA route
app.post("/cca", fbAuthAdmin, createCCA);
app.get("/cca", getAllCCA);
app.get("/cca/members", fbAuthAdmin, getAllMembers);
app.get("/cca/request", fbAuthAdmin, getPendingRequest);
app.post("/cca/accept", fbAuthAdmin, acceptRequest);
app.post("/cca/decline", fbAuthAdmin, declineRequest);

// User route
app.post("/signup", signup);
app.post("/login", login);
app.get("/user", fbAuthUser, getUserDetails);
app.post("/user/admin", fbAuthUser, setCurrentUserAsAdmin);
app.post("/user/join", fbAuthUser, join);

// Test
// app.put("/test", FBAuth, setCurrentUserAsAdmin);

exports.api = functions.region("asia-east2").https.onRequest(app);

exports.updateCCAParticipatedOnRequestAccept = functions
  .region("asia-east2")
  .firestore.document("/cca/{name}")
  .onUpdate((change) => {
    const before = change.before.data().listOfMembers;
    const after = change.after.data().listOfMembers;
    const cca = change.before.data().name;

    if (before.length !== after.length) {
      const batch = db.batch();

      return db
        .collection("/users")
        .where("studentCard", "==", after[after.length - 1])
        .limit(1)
        .get()
        .then((data) => {
          const ccaParticipated = [];

          data.docs[0].data().ccaParticipated.forEach((cca) => {
            ccaParticipated.push(cca);
          });

          ccaParticipated.push(cca);

          batch.update(db.doc(`/users/${data.docs[0].data().studentCard}`), {
            ccaParticipated,
          });

          return batch.commit();
        });
    }
  });

// TODO:
// validate input of attendance taking

// New Collection: Request
// field :
//    user:
//    cca:
//    status:

// Trigger:
// update adminStatus or cca admin property
