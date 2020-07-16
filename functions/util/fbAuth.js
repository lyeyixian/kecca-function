const { admin, db } = require("./admin");

exports.fbAuthUser = (req, res, next) => {
  let idToken;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("User ")
  ) {
    idToken = req.headers.authorization.split("User ")[1];
  } else {
    console.error("No token found");

    return res.status(403).json({ error: "Unauthorized" });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;

      return db
        .collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then((data) => {
      req.user.studentCard = data.docs[0].data().studentCard;

      return next();
    })
    .catch((err) => {
      console.error("Error while verifying token", err);

      return res.status(403).json(err);
    });
};

exports.fbAuthAdmin = (req, res, next) => {
  let idToken;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Admin ")
  ) {
    idToken = req.headers.authorization.split("Admin ")[1];
  } else {
    console.error("No token found");

    return res.status(403).json({ error: "Unauthorized" });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      req.admin = decodedToken;

      return db
        .collection("users")
        .where("userId", "==", req.admin.uid)
        .limit(1)
        .get();
    })
    .then((data) => {
      req.admin.studentCard = data.docs[0].data().studentCard;
      req.admin.cca = data.docs[0].data().adminStatus.cca;

      return next();
    })
    .catch((err) => {
      console.error("Error while verifying token", err);

      return res.status(403).json(err);
    });
};
