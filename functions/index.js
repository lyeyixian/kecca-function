// Firebase
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const firebase = require("firebase");
const firebaseConfig = {
  apiKey: "AIzaSyCsc9LpTd-ZGCFynkqj0eJuxEt4NJlRqy8",
  authDomain: "my-kecca.firebaseapp.com",
  databaseURL: "https://my-kecca.firebaseio.com",
  projectId: "my-kecca",
  storageBucket: "my-kecca.appspot.com",
  messagingSenderId: "352665839619",
  appId: "1:352665839619:web:5e8aa66d7b366ca7ea0636",
  measurementId: "G-N0CM7Q9LDL",
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://my-kecca.firebaseio.com",
});

firebase.initializeApp(firebaseConfig);

// Express
const app = require("express")();

// Get all events
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

// Create an event
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

// Sign up
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    name: req.body.name,
    studentCard: req.body.studentCard,
    nusnetId: req.body.nusnetId,
  };

  firebase
    .auth()
    .createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then((data) => {
      return res
        .status(201)
        .json({ message: `user ${data.user.uid} signed up successfully` });
    })
    .catch((err) => {
      console.error(err);

      return res.status(500).json({ error: err.code });
    });
});

exports.api = functions.region("asia-east2").https.onRequest(app);
