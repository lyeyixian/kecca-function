const { db } = require("../util/admin");

const firebase = require("firebase");
const firebaseConfig = require("../util/config");

firebase.initializeApp(firebaseConfig);

const { validateSignupData, validateLoginData } = require("../util/validators");

exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    name: req.body.name,
    studentCard: req.body.studentCard,
  };
  let token, userId;

  const { valid, errors } = validateSignupData(newUser);

  if (!valid) {
    return res.status(400).json(errors);
  }

  db.doc(`/users/${newUser.studentCard}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res
          .status(400)
          .json({ studentCard: "Student card number already exists" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredential = {
        userId,
        createdAt: new Date().toISOString(),
        name: newUser.name,
        email: newUser.email,
        studentCard: newUser.studentCard,
        adminStatus: {
          tokenHeader: "User ",
          cca: "",
        },
      };

      return db.doc(`/users/${newUser.studentCard}`).set(userCredential);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);

      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email is already in use" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
};

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  const { valid, errors } = validateLoginData(user);

  if (!valid) {
    return res.status(400).json(errors);
  }

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/wrong-password") {
        return res
          .status(403)
          .json({ general: "Wrong credentials, please try again" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
};

exports.setCurrentUserAsAdmin = (req, res) => {
  const adminStatus = {
    tokenHeader: "Admin ",
    cca: req.body.cca,
  };

  db.doc(`/users/${req.user.studentCard}`)
    .update({ adminStatus })
    .then(() => {
      return res.json({ message: "Admin status updated successfully" });
    })
    .catch((err) => {
      console.error(err);

      return res.status(500).json({ error: err.code });
    });
};

exports.join = (req, res) => {
  db.doc(`/cca/${req.body.cca}`)
    .get()
    .then((doc) => {
      const pending = doc.data().pending;
      pending.push(req.user.studentCard);

      return db.doc(`/cca/${req.body.cca}`).update({ pending });
    })
    .then(() => {
      return res.json({ message: "Request sent successfully" });
    })
    .catch((err) => {
      console.error(err);

      return res.status(500).json({ error: err.code });
    });
};
