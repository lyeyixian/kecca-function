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
