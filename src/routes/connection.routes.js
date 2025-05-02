const express = require("express");
const router = express.Router();
const { connectionController } = require("../controllers");
const { userAuth } = require("../middlewares/auth");

// Get connection requests
router.get("/sent", userAuth, connectionController.getSentConnections);
router.get("/received", userAuth, connectionController.getReceivedConnections);

// Send connection requests
router.post("/request", userAuth, connectionController.sendConnectionRequest);
router.post("/skip", userAuth, connectionController.skipUser);

// Respond to connection requests
router.post("/respond", userAuth, connectionController.respondToConnection);

module.exports = router;
