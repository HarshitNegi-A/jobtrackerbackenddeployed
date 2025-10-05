const axios = require("axios");
require("dotenv").config();

/**
 * Sends an email using the Brevo (Sendinblue) API.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 */
async function sendViaSendinblue(to, subject, html) {
  try {
    const payload = {
      sender: { email: process.env.FROM_EMAIL, name: "Job Tracker" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };

    const res = await axios.post("https://api.brevo.com/v3/smtp/email", payload, {
      headers: {
        "api-key": process.env.SENDINBLUE_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 10000, // 10s safety timeout
    });

    console.log(`✅ Email sent via Brevo API to: ${to}`);
    return res.data;
  } catch (err) {
    const errorData = err.response?.data || err.message;
    console.error("❌ Sendinblue API error:", errorData);
    throw new Error(errorData.message || "Email sending failed");
  }
}

module.exports = { sendViaSendinblue };
