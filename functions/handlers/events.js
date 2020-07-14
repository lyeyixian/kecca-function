const { db } = require("../util/admin");

exports.getAllEvents = (req, res) => {
  db.collection("/events")
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
};

exports.createOneEvent = (req, res) => {
  const newEvent = {
    name: req.body.name,
    duration: req.body.duration,
    listOfAttendees: req.body.listOfAttendees,
    createdAt: new Date().toISOString(),
    organiser: req.body.organiser,
  };

  db.collection("/events")
    .add(newEvent)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      console.error(err);

      return res.status(500).json({ error: "something went wrong" });
    });
};
