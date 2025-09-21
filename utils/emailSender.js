const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: false, // TLS over 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendReminderEmail(to, subject, html) {
  return transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html,
  });
}

module.exports = { sendReminderEmail };
