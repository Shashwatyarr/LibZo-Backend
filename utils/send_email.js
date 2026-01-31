const axios = require("axios");

exports.sendOtpEmail = async (email, otp) => {
  try {
    const res = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: process.env.BREVO_SENDER_NAME,
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [
          {
            email: email,
          },
        ],
        subject: "Your Libzo OTP",
        htmlContent: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Libzo Verification Code</h2>
            <p>Your OTP is:</p>
            <h1 style="letter-spacing: 4px;">${otp}</h1>
            <p>This code is valid for 5 minutes.</p>
          </div>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("✅ OTP email sent:", res.data);
  } catch (err) {
    console.error("❌ OTP email error:", err.response?.data || err.message);
    throw err;
  }
};
