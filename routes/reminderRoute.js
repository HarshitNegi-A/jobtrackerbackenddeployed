const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const controller = require("../controller/reminderController");

// Routes
router.post("/reminders", auth, controller.createReminder);
router.get("/reminders", auth, controller.listReminders);
router.delete("/reminders/:id", auth, controller.deleteReminder);
router.post("/reminders/:id/dismiss", auth, controller.dismissReminder);

module.exports = router;
