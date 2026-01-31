const nodemailer = require("nodemailer");

exports.sendOtpEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false, // 587 ke liye false
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Libzo" <no-reply@libzo.com>`,
      to: email,
      subject: "Your Libzo OTP",
      html: `
        <h2>Libzo Verification Code</h2>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      `,
    });

    console.log("✅ OTP email sent");
  } catch (err) {
    console.error("❌ OTP email error:", err);
    throw err;
  }
};
