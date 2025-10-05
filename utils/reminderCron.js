// cron/reminderCron.js
const cron = require("node-cron");
const { Op } = require("sequelize");
const Reminder = require("../model/ReminderModel");
const Application = require("../model/ApplicationModel");
const Company = require("../model/CompanyModel");
const User = require("../model/UserModel");
const { sendViaSendinblue } = require("../utils/sendinblueApi");

function startReminderCron() {
  cron.schedule("*/1 * * * *", async () => {
    try {
      const now = new Date();

      const dueReminders = await Reminder.findAll({
        where: { status: "pending", remindAt: { [Op.lte]: now } },
        include: [
          { model: Application, attributes: ["title"], include: [{ model: Company, attributes: ["name"] }] },
          { model: User, attributes: ["name", "email"] },
        ],
      });

      if (!dueReminders.length) return console.log("⏰ No reminders due now");

      for (const r of dueReminders) {
        const user = r.User;
        const app = r.Application;
        const company = app?.Company?.name || "Unknown Company";

        const subject = `Reminder: ${app?.title || "Application"} at ${company}`;
        const html = `
          <p>Hi ${user?.name || "there"},</p>
          <p>This is your reminder for <b>${app?.title || "an application"}</b> at <b>${company}</b>.</p>
          <p>Note: ${r.note || "—"}</p>
          <p>Scheduled at: ${new Date(r.remindAt).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}</p>
        `;

        try {
          await sendViaSendinblue(user.email, subject, html);
          await r.update({ status: "sent", sentAt: new Date() });
          console.log(`✅ Reminder sent to ${user.email}`);
        } catch (err) {
          console.error(`❌ Failed to send reminder to ${user.email}:`, err.message);
        }
      }
    } catch (err) {
      console.error("Cron job error:", err.message);
    }
  });

  console.log("🚀 Reminder cron started (every 1 minute)");
}

module.exports = startReminderCron;
