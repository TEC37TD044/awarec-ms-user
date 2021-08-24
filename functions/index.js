const express = require("express");
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const cors = require('cors');

admin.initializeApp(functions.config().firebase);

const auth = admin.auth();
const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: true }));

app.get("/users", async function getUser(req, res) {
  auth.listUsers().then((userRecords) => {
    res.status(200).send(userRecords.users);
  }).catch((error) => {
    res.status(500).send(error);
  });
});

app.get("/users/:userId", async function getUserById(req, res) {
  const {params} = req;
  const { userId } = params;
  auth.getUser(userId).then((user) => {
    res.status(200).send(user);
  }).catch((error) => {
    res.status(500).send(error);
  });
});

app.post("/users", async function createUser(req, res) {
  const {body} = req;
  const { role = user, disabled = false, ...rest } = body;
  /**
   * email: email,
   * emailVerified: false,
   * password: password,
   * displayName: fullName,
   * disabled: false,
   */
  auth
      .createUser({
        ...rest,
        disabled
      })
      .then((userRecord) => {
        auth.setCustomUserClaims(userRecord.uid, { role }).then(() => {
          res.status(200).send(userRecord);
        });
      })
      .catch((error) => {
        console.log("Error creating new user:", error);
        res.status(500).send(error);
      });
});

app.put("/users/:userId", async function updateUser(req, res) {
  const {body, params} = req;
  const { role = 'user', disabled = false , ...rest } = body;
  const { userId } = params;
  auth
      .updateUser(userId, {
        ...rest,
        disabled,
      })
      .then((userRecord) => {
        auth.setCustomUserClaims(userRecord.uid, { role }).then(() => {
          res.status(200).send(userRecord);
        });
      })
      .catch((error) => {
        console.log("Error updating new user:", error);
        res.status(500).send(error);
      });
});

app.delete("/users/:userId", async function deleteUser(req, res) {
  const { params } = req;
  const { userId } = params;
  auth
      .deleteUser(userId)
      .then(() => {
        res.status(200).send(`Deleted user: ${userId}`);
      })
      .catch((error) => {
        console.log("Error deleting user:", error);
        res.status(500).send(error);
      });
});

module.exports = {
  api: functions.https.onRequest(app),
};
