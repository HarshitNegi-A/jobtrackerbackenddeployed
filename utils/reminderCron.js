const cron = require("node-cron");
const { Op } = require("sequelize");
const Reminder = require("../model/ReminderModel");
const Application = require("../model/ApplicationModel");
const Company = require("../model/CompanyModel");
const User = require("../model/UserModel");

// 📨 Primary email sender (Brevo API)
const { sendViaSendinblue } = require("../utils/sendinblueApi");

// 🧩 Optional local SMTP fallback (works locally, not on Railway)
let sendReminderEmail;
try {
  sendReminderEmail = require("./emailSender").sendReminderEmail;
} catch (e) {
  console.log("⚠️ No SMTP sender found, will use Sendinblue only");
}

function startReminderCron() {
  // Run every minute
  cron.schedule("*/1 * * * *", async () => {
    try {
      const now = new Date();

      // Find due reminders (status=pending and time passed)
      const dueReminders = await Reminder.findAll({
        where: {
          status: "pending",
          remindAt: { [Op.lte]: now },
        },
        include: [
          {
            model: Application,
            attributes: ["title"],
            include: [{ model: Company, attributes: ["name"] }],
          },
          { model: User, attributes: ["name", "email"] },
        ],
      });

      if (dueReminders.length === 0) {
        console.log("⏰ No reminders due at this time");
        return;
      }

      console.log(`📬 Found ${dueReminders.length} reminders to send...`);

      for (const r of dueReminders) {
        try {
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

          // 🧩 Try Sendinblue first
          try {
            await sendViaSendinblue(user.email, subject, html);
            console.log(`✅ Reminder sent to ${user.email} via Brevo API`);
          } catch (apiErr) {
            console.error("❌ Sendinblue failed:", apiErr.message);

            // Optional fallback for local testing
            if (sendReminderEmail) {
              console.warn("Attempting SMTP fallback...");
              await sendReminderEmail(user.email, subject, html);
              console.log(`✅ Reminder sent to ${user.email} via SMTP fallback`);
            } else {
              throw apiErr;
            }
          }

          // ✅ Mark reminder as sent
          await r.update({ status: "sent", sentAt: new Date() });
        } catch (err) {
          console.error("Error sending reminder:", err.message);
        }
      }
    } catch (err) {
      console.error("Cron job error:", err.message);
    }
  });

  console.log("🚀 Reminder cron started (runs every 1 minute)");
}

module.exports = startReminderCron;
