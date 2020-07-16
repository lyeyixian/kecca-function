const { db } = require("../util/admin");

exports.createCCA = (req, res) => {
  const ccaCredentials = {
    name: req.admin.cca,
    listOfMembers: req.body.listOfMembers,
    admin: req.admin.studentCard,
  };

  db.collection("/cca")
    .add(ccaCredentials)
    .then((doc) => {
      res.json({
        message: `document ${doc.id} (${ccaCredentials.name}) created successfully`,
      });
    })
    .catch((err) => {
      console.error(err);

      return res.status(500).json({ error: err.code });
    });
};

exports.getAllMembers = (req, res) => {
  const membersData = {};

  db.collection("cca")
    .where("name", "==", req.admin.cca)
    .limit(1)
    .get()
    .then((data) => {
      membersData.listOfMembers = data.docs[0].data().listOfMembers;

      return res.json(membersData);
    })
    .catch((err) => {
      console.error(err);

      return res.status(500).json({ error: err.code });
    });
};
