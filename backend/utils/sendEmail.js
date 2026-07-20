import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

const OTP_EMAIL_CONTENT = {
  studentVerify: {
    subject: "Your Rungta Student Verification OTP",
    heading: "Rungta Student Verification",
    introLine: "Use the code below to verify that you're a Rungta student on RungtaStudentXchange.",
    footerLine: (minutes) =>
      `Ye OTP sirf Student Verification ke liye hai — kisi ke saath share mat karna. Ye ${minutes} minute me expire ho jaayega. Agar tumne ye request nahi ki, toh ignore kar sakte ho.`,
  },
  passwordReset: {
    subject: "Your RungtaStudentXchange Password Reset OTP",
    heading: "Password Reset Request",
    introLine: "Use the code below to reset your RungtaStudentXchange account password.",
    footerLine: (minutes) =>
      `Ye OTP sirf Password Reset ke liye hai — kisi ke saath share mat karna. Ye ${minutes} minute me expire ho jaayega. Agar tumne password reset request nahi ki, toh is email ko ignore kar do — tumhara password safe hai.`,
  },
  emailVerify: {
    subject: "Your RungtaStudentXchange Verification Code",
    heading: "Verify Your Email",
    introLine: "Use the code below to complete your verification on RungtaStudentXchange.",
    footerLine: (minutes) =>
      `This code will expire in ${minutes} minutes. If you didn't request this, you can safely ignore this email.`,
  },
};

export const sendOTPEmail = async (to, otp, purpose = "studentVerify") => {
  const content = OTP_EMAIL_CONTENT[purpose] || OTP_EMAIL_CONTENT.emailVerify;
  const minutes = process.env.OTP_EXPIRY_MINUTES || 10;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #111827;">${content.heading}</h2>
      <p style="color: #374151; font-size: 15px;">
        ${content.introLine}
      </p>
      <div style="background: #f3f4f6; padding: 16px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #111827;">
          ${otp}
        </span>
      </div>
      <p style="color: #6b7280; font-size: 13px;">
        ${content.footerLine(minutes)}
      </p>
    </div>
  `;

  await sendEmail({ to, subject: content.subject, html });
};
