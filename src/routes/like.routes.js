const express = require("express");
const router = express.Router();
const { likeController } = require("../controllers");
const { userAuth } = require("../middlewares/auth");

router.post("/", userAuth, likeController.likeUser);
router.delete("/", userAuth, likeController.unlikeUser);

module.exports = router;
