const { DateTime } = require("luxon");
const Reminder = require("../model/ReminderModel");
const Application = require("../model/ApplicationModel");

// ---------------- CREATE REMINDER ----------------
exports.createReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { applicationId, note, remindAt } = req.body;

    if (!applicationId || !remindAt) {
      return res
        .status(400)
        .json({ message: "applicationId and remindAt are required" });
    }

    // Ensure app belongs to current user
    const app = await Application.findOne({
      where: { id: applicationId, userId },
    });
    if (!app)
      return res.status(404).json({ message: "Application not found" });

    // 🕒 Convert local (IST) reminder time to UTC before saving
    const utcRemindAt = DateTime.fromISO(remindAt, {
      zone: "Asia/Kolkata",
    })
      .toUTC()
      .toISO();

    const reminder = await Reminder.create({
      userId,
      applicationId,
      note,
      remindAt: utcRemindAt, // ✅ Save UTC version
      status: "pending",
    });

    // Fetch reminder with app info
    const reminderWithApp = await Reminder.findByPk(reminder.id, {
      include: [{ model: Application, attributes: ["id", "title", "company"] }],
    });

    res
      .status(201)
      .json({ message: "Reminder created", reminder: reminderWithApp });
  } catch (err) {
    console.error("createReminder:", err);
    res.status(500).json({ message: "Error creating reminder" });
  }
};

// ---------------- LIST REMINDERS ----------------
exports.listReminders = async (req, res) => {
  try {
    const userId = req.user.id;

    const reminders = await Reminder.findAll({
      where: { userId },
      include: [{ model: Application, attributes: ["id", "title", "company"] }],
      order: [["remindAt", "ASC"]],
    });

    // 🕒 Convert stored UTC times back to IST before sending
    const remindersWithLocalTime = reminders.map((reminder) => {
      const localTime = DateTime.fromISO(reminder.remindAt, { zone: "utc" })
        .setZone("Asia/Kolkata")
        .toISO();

      return {
        ...reminder.toJSON(),
        remindAt: localTime, // ✅ return IST time to frontend
      };
    });

    res.json(remindersWithLocalTime);
  } catch (err) {
    console.error("listReminders:", err);
    res.status(500).json({ message: "Error listing reminders" });
  }
};

// ---------------- DELETE REMINDER ----------------
exports.deleteReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const deleted = await Reminder.destroy({
      where: { id: req.params.id, userId },
    });
    if (!deleted)
      return res.status(404).json({ message: "Reminder not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteReminder:", err);
    res.status(500).json({ message: "Error deleting reminder" });
  }
};

// ---------------- DISMISS REMINDER ----------------
exports.dismissReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const [updated] = await Reminder.update(
      { status: "dismissed" },
      { where: { id: req.params.id, userId } }
    );
    if (!updated)
      return res.status(404).json({ message: "Reminder not found" });
    res.json({ message: "Dismissed" });
  } catch (err) {
    console.error("dismissReminder:", err);
    res.status(500).json({ message: "Error dismissing reminder" });
  }
};
