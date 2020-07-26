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
    dateTime: req.body.dateTime,
    duration: req.body.duration,
    createdAt: new Date().toISOString(),
    organiser: req.admin.studentCard,
    cca: req.admin.cca,
  };

  db.collection("/events")
    .add(newEvent)
    .then((doc) => {
      return res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      console.error(err);

      return res.status(500).json({ error: "something went wrong" });
    });
};

exports.getParticipatedEvents = (req, res) => {
  db.collection("/events")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      const allParticipatedEvents = [];

      data.forEach((doc) => {
        if (
          doc
            .data()
            .listOfAttendees.find((student) => student === req.user.studentCard)
        ) {
          allParticipatedEvents.push({
            eventId: doc.id,
            name: doc.data().name,
            organiser: doc.data().organiser,
            cca: doc.data().cca,
            duration: doc.data().duration,
            dateTime: doc.data().dateTime,
          });
        }

        return res.json(allParticipatedEvents);
      });
    })
    .catch((err) => {
      console.error(err);

      return res.status(500).json({ error: err.code });
    });
};

exports.getParticipatedEventsAdmin = (req, res) => {
  db.collection("/events")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      const allParticipatedEvents = [];

      data.forEach((doc) => {
        if (
          doc
            .data()
            .listOfAttendees.find(
              (student) => student === req.admin.studentCard
            )
        ) {
          allParticipatedEvents.push({
            eventId: doc.id,
            name: doc.data().name,
            organiser: doc.data().organiser,
            cca: doc.data().cca,
            duration: doc.data().duration,
            dateTime: doc.data().dateTime,
          });
        }

        return res.json(allParticipatedEvents);
      });
    })
    .catch((err) => {
      console.error(err);

      return res.status(500).json({ error: err.code });
    });
};

exports.getOrganisedEvents = (req, res) => {
  db.collection("/events")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      const allOrganisedEvents = [];

      data.forEach((doc) => {
        if (doc.data().cca === req.admin.cca) {
          allOrganisedEvents.push({
            eventId: doc.id,
            ...doc.data(),
          });
        }

        return res.json(allOrganisedEvents);
      });
    })
    .catch((err) => {
      console.error(err);

      return res.status(500).json({ error: err.code });
    });
};

exports.takeAttendance = (req, res) => {
  const ccaDocument = db.doc(`/cca/${req.admin.cca}`);
  const eventDocument = db.doc(`/events/${req.params.eventId}`);
  const listOfAttendees = req.body.listOfAttendees;
  let listOfAbsentees = [];

  ccaDocument
    .get()
    .then((doc) => {
      doc.data().listOfMembers.forEach((user) => {
        listOfAbsentees.push(user);
      });
      req.body.listOfAttendees.forEach((user) => {
        const index = listOfAbsentees.indexOf(user);

        listOfAbsentees.splice(index, 1);
      });

      return eventDocument.update({
        listOfAttendees,
        listOfAbsentees,
      });
    })
    .then(() => {
      return res.json({ message: "Attendance taken successfully" });
    })
    .catch((err) => {
      console.error(err);

      return res.status(500).json({ error: err.code });
    });
};
