import nodemailer from "nodemailer";

interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailProps) {
  try {
    const info = await transporter.sendMail({
      from: `"Habit Tracker" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    return info;
  } catch (error) {
    console.error("Email Error:", error);
    throw error;
  }
}