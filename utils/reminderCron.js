const cron = require("node-cron");
const { Op } = require("sequelize");
const Reminder = require("../model/ReminderModel");
const Application = require("../model/ApplicationModel");
const Company = require("../model/CompanyModel"); // ✅ import
const User = require("../model/UserModel");
const { sendReminderEmail } = require("./emailSender");

function startReminderCron() {
  // Run every minute
  cron.schedule("*/1 * * * *", async () => {
    try {
      const now = new Date();

      // Find due reminders
      const dueReminders = await Reminder.findAll({
        where: {
          status: "pending",
          remindAt: { [Op.lte]: now },
        },
        include: [
          {
            model: Application,
            attributes: ["title"],
            include: [{ model: Company, attributes: ["name"] }], // ✅ join company
          },
          { model: User, attributes: ["name", "email"] },
        ],
      });

      for (const r of dueReminders) {
        try {
          const user = r.User;
          const app = r.Application;

          await sendReminderEmail(
            user.email,
            `Reminder: ${app?.title} at ${app?.Company?.name || "Unknown Company"}`,
            `<p>Hi ${user.name},</p>
             <p>This is your reminder for <b>${app?.title}</b> at <b>${app?.Company?.name || "Unknown Company"}</b>.</p>
             <p>Note: ${r.note || "—"}</p>
             <p>Scheduled at: ${new Date(r.remindAt).toLocaleString()}</p>`
          );

          // Mark as sent
          await r.update({ status: "sent", sentAt: new Date() });

          console.log("Reminder sent to:", user.email);
        } catch (err) {
          console.error("Error sending reminder:", err.message);
        }
      }
    } catch (err) {
      console.error("Cron job error:", err.message);
    }
  });

  console.log("Reminder cron started (every 1 min)");
}

module.exports = startReminderCron;
