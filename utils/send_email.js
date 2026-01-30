const nodemailer = require("nodemailer");

exports.sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const sendOtpEmail = {
    from: `"Libzo" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Libzo OTP",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Libzo Verification Code</h2>
        <p>Your OTP is:</p>
        <h1 style="letter-spacing: 4px;">${otp}</h1>
        <p>This code is valid for 5 minutes.</p>
      </div>
    `,
  };

  await transporter.sendMail(sendOtpEmail);
};
