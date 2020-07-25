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
  getTargetUserDetails,
  getAdminDetails,
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
app.get("/user/:userId", getTargetUserDetails);
app.get("/user", fbAuthUser, getUserDetails);
app.post("/user/admin", fbAuthUser, setCurrentUserAsAdmin);
app.post("/user/join", join);
app.get("/admin", fbAuthAdmin, getAdminDetails);

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

    if (before.length < after.length) {
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

exports.updateCCAAdminOnUserAdminStatusChange = functions
  .region("asia-east2")
  .firestore.document("/users/{studentCard}")
  .onUpdate((change) => {
    const before = change.before.data().adminStatus;
    const after = change.after.data().adminStatus;
    const studentCard = change.after.data().studentCard;

    db.doc(`/cca/${after.cca}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          if (before.cca !== after.cca && after.tokenHeader === "Admin ") {
            const batch = db.batch();
            const admin = studentCard;
            batch.update(db.doc(`/cca/${after.cca}`), { admin });

            return batch.commit();
          }
        }
      })
      .catch((err) => console.log(err));
  });

exports.updateAdminStatusOnCCAAdminChange = functions
  .region("asia-east2")
  .firestore.document("/cca/{name}")
  .onUpdate((change) => {
    const before = change.before.data().admin;
    const after = change.after.data().admin;

    if (before !== after) {
      const batch = db.batch();
      const adminStatus = {
        cca: "",
        tokenHeader: "User ",
      };

      batch.update(db.doc(`/users/${before}`), { adminStatus });

      return batch.commit();
    }
  });

// TODO:
// validate input of all

// New Collection: Request
// field :
//    user:
//    cca:
//    status:

// Trigger:
