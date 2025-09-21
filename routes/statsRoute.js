const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const statsController = require("../controller/statsController");

router.get("/status", auth, statsController.statusStats);
router.get("/timeline", auth, statsController.timelineStats);

module.exports = router;
