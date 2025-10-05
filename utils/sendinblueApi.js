const axios = require("axios");
require("dotenv").config();

async function sendViaSendinblue(to, subject, html) {
  try {
    const res = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: process.env.FROM_EMAIL, name: "Job Tracker" },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: { "api-key": process.env.SENDINBLUE_API_KEY },
      }
    );
    console.log("✅ Sent via Sendinblue:", to);
    return res.data;
  } catch (err) {
    console.error("❌ Sendinblue error:", err.response?.data || err.message);
    throw err;
  }
}

module.exports = { sendViaSendinblue };
