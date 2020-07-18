const { db } = require("../util/admin");

exports.createCCA = (req, res) => {
  const ccaCredentials = {
    name: req.admin.cca,
    listOfMembers: [],
    admin: req.admin.studentCard,
    pending: [],
  };

  db.doc(`/cca/${ccaCredentials.name}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ cca: "CCA already exists" });
      } else {
        return db.doc(`/cca/${ccaCredentials.name}`).set(ccaCredentials);
      }
    })
    .then((doc) => {
      res.json({
        message: `CCA (${ccaCredentials.name}) created successfully`,
      });
    })
    .catch((err) => {
      console.error(err);

      return res.status(500).json({ error: err.code });
    });
};

exports.getAllMembers = (req, res) => {
  let membersData = [];

  db.collection("cca")
    .where("name", "==", req.admin.cca)
    .limit(1)
    .get()
    .then((data) => {
      membersData = data.docs[0].data().listOfMembers;

      return res.json(membersData);
    })
    .catch((err) => {
      console.error(err);

      return res.status(500).json({ error: err.code });
    });
};

exports.getAllCCA = (req, res) => {
  db.collection("/cca")
    .get()
    .then((data) => {
      let ccas = [];

      data.forEach((doc) => {
        ccas.push(doc.data().name);
      });

      return res.json(ccas);
    })
    .catch((err) => {
      console.error(err);

      return res.status(500).json({ error: err.code });
    });
};

exports.getPendingRequest = (req, res) => {
  db.doc(`/cca/${req.admin.cca}`)
    .get()
    .then((doc) => {
      let pendingRequest = [];

      doc.data().pending.forEach((user) => {
        let studentCredential = {};

        db.doc(`/users/${user}`)
          .get()
          .then((doc) => {
            studentCredential = {
              ...doc.data(),
            };
            pendingRequest.push(studentCredential);

            return res.json(pendingRequest);
          })
          .catch((err) => {
            console.error(err);

            return res.status(500).json({ error: err.code });
          });
      });
    })
    .catch((err) => {
      console.error(err);

      return res.status(500).json({ error: err.code });
    });
};

exports.acceptRequest = (req, res) => {
  const user = req.body.user;
  let pendingRequest = [];
  let listOfMembers = [];
  let updatedCredentials = {};
  const ccaDocument = db.doc(`/cca/${req.admin.cca}`);

  ccaDocument
    .get()
    .then((doc) => {
      doc.data().pending.forEach((user) => {
        pendingRequest.push(user);
      });
      doc.data().listOfMembers.forEach((user) => {
        listOfMembers.push(user);
      });

      const index = pendingRequest.indexOf(user);

      pendingRequest.splice(index, 1);
      listOfMembers.push(user);
      updatedCredentials = {
        listOfMembers,
        pending: pendingRequest,
      };

      return ccaDocument.update(updatedCredentials);
    })
    .then(() => {
      return res.json({ message: "Join request accepted successfully" });
    })
    .catch((err) => {
      console.error(err);

      return res.status(500).json({ error: err.code });
    });
};

exports.declineRequest = (req, res) => {
  let pending = [];
  const ccaDocument = db.doc(`/cca/${req.admin.cca}`);

  ccaDocument
    .get()
    .then((doc) => {
      doc.data().pending.forEach((user) => {
        pending.push(user);
      });

      const index = pending.indexOf(req.body.user);

      pending.splice(index, 1);

      return ccaDocument.update({ pending });
    })
    .then(() => {
      return res.json({ message: "Request declined successfully" });
    })
    .catch((err) => {
      console.error(err);

      return res.status(500).json({ error: err.code });
    });
};
