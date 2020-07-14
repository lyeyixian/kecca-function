const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://my-kecca.firebaseio.com",
});

const express = require("express");
const app = express();

app.get("/events", (req, res) => {
  admin
    .firestore()
    .collection("/events")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let events = [];
      data.forEach((doc) => {
        events.push({
          eventId: doc.id,
          ...doc.data(),
        });
      });
      return res.json(events);
    })
    .catch((err) => console.error(err));
});

app.post("/event", (req, res) => {
  const newEvent = {
    name: req.body.name,
    duration: req.body.duration,
    listOfAttendees: req.body.listOfAttendees,
    createdAt: new Date().toISOString(),
    organiser: req.body.organiser,
  };

  admin
    .firestore()
    .collection("/events")
    .add(newEvent)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: "something went wrong" });
    });
});

exports.api = functions.region("asia-east2").https.onRequest(app);
