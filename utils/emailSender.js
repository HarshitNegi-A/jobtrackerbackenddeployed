// const nodemailer = require("nodemailer");
// require("dotenv").config();

// const transporter = nodemailer.createTransport({
//   pool: true, // ✅ Use pooled connections
//   host: process.env.SMTP_HOST,
//   port: parseInt(process.env.SMTP_PORT || "587", 10),
//   secure: false, // TLS over 587
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
//   maxConnections: 5, // ✅ only 5 parallel SMTP connections
//   maxMessages: 100,  // ✅ recycle connection after 100 messages
//   connectionTimeout: 15_000, // 15s connection timeout
//   socketTimeout: 15_000,     // 15s socket timeout
//   greetingTimeout: 10_000,   // 10s wait for greeting
//   logger: false,             // set to true if debugging SMTP issues
// });

// // Verify transporter once on startup
// transporter.verify((err, success) => {
//   if (err) {
//     console.error("❌ SMTP verification failed:", err.message);
//   } else {
//     console.log("✅ SMTP server ready to send emails");
//   }
// });

// async function sendReminderEmail(to, subject, html) {
//   try {
//     const info = await transporter.sendMail({
//       from: process.env.FROM_EMAIL,
//       to,
//       subject,
//       html,
//     });
//     console.log("Email sent:", info.messageId);
//     return info;
//   } catch (err) {
//     console.error("Email send failed:", err.message);
//     throw err;
//   }
// }

// module.exports = { sendReminderEmail, transporter };
