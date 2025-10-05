const { DateTime } = require("luxon");
const Reminder = require("../model/ReminderModel");
const Application = require("../model/ApplicationModel");


// ---------------- CREATE REMINDER ----------------
exports.createReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { applicationId, note, remindAt } = req.body;
    console.log("Received remindAt from frontend:", remindAt);
    if (!applicationId || !remindAt) {
      return res.status(400).json({
        message: "applicationId and remindAt are required",
      });
    }

    // Ensure app belongs to current user
    const app = await Application.findOne({
      where: { id: applicationId, userId },
    });
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    // 🕒 Parse and validate — frontend already sends UTC ISO
    const parsed = DateTime.fromISO(remindAt, { zone: "utc" });
    if (!parsed.isValid) {
      return res.status(400).json({ message: "Invalid remindAt format" });
    }

    // Store directly as UTC ISO
    const utcRemindAt = parsed.toISO();

    const reminder = await Reminder.create({
      userId,
      applicationId,
      note,
      remindAt: utcRemindAt,
      status: "pending",
    });

    const reminderWithApp = await Reminder.findByPk(reminder.id, {
      include: [{ model: Application, attributes: ["id", "title", "company"] }],
    });

    res.status(201).json({
      message: "Reminder created",
      reminder: reminderWithApp,
    });
  } catch (err) {
    console.error("createReminder:", err);
    res.status(500).json({ message: "Error creating reminder" });
  }
};

const { DateTime } = require("luxon");
const Reminder = require("../model/ReminderModel");
const Application = require("../model/ApplicationModel");

exports.listReminders = async (req, res) => {
  try {
    const userId = req.user.id;

    const reminders = await Reminder.findAll({
      where: { userId },
      include: [{ model: Application, attributes: ["id", "title", "company"] }],
      order: [["remindAt", "ASC"]],
    });

    const remindersWithLocalTime = reminders.map((reminder) => {
      let utc = reminder.remindAt;

      // 1️⃣ Handle empty/null values
      if (!utc) {
        return { ...reminder.toJSON(), remindAt: null };
      }

      // 2️⃣ Handle Date objects (common in Sequelize)
      if (utc instanceof Date) {
        utc = utc.toISOString(); // ✅ safely convert to ISO string
      }

      // 3️⃣ Normalize MySQL DATETIME strings (e.g. "2025-10-05 23:22:00")
      if (typeof utc === "string" && !utc.includes("T")) {
        utc = utc.replace(" ", "T") + "Z";
      }

      // 4️⃣ Parse the UTC date
      const parsed = DateTime.fromISO(utc, { zone: "utc" });
      if (!parsed.isValid) {
        console.warn("⚠️ Invalid remindAt:", utc);
        return { ...reminder.toJSON(), remindAt: null };
      }

      // 5️⃣ Convert UTC → IST and format nicely
      const localTime = parsed
        .setZone("Asia/Kolkata")
        .toISO({ suppressMilliseconds: true });

      return {
        ...reminder.toJSON(),
        remindAt: localTime,
      };
    });

    res.json(remindersWithLocalTime);
  } catch (err) {
    console.error("listReminders error:", err);
    res.status(500).json({
      message: "Error listing reminders",
      error: err.message,
    });
  }
};



// ---------------- DELETE REMINDER ----------------
exports.deleteReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const deleted = await Reminder.destroy({
      where: { id: req.params.id, userId },
    });

    if (!deleted) {
      return res.status(404).json({ message: "Reminder not found" });
    }

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

    if (!updated) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    res.json({ message: "Dismissed" });
  } catch (err) {
    console.error("dismissReminder:", err);
    res.status(500).json({ message: "Error dismissing reminder" });
  }
};
