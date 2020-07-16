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
