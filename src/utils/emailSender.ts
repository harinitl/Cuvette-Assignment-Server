import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.SENDER_EMAIL || "",
    pass: process.env.EMAIL_SEC_KEY || "",
  },
});

export const sendEmailVerificationLink = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) => {
  const mailOptions = {
    from: {
      name: "Harini from Job Portal",
      address: process.env.SENDER_EMAIL || "",
    },
    to: email,
    subject: "Email Confirmation",
    text: "Please click on the link below to verify your email",
    html: `<p>Hello!</p>
      <p>Thank you for signing up with Job portal. Please confirm your email by using this Otp: ${otp} </p>
     
      <p>Best regards,</p>
      <p>Job Portal</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email verification mail sent successfully");
  } catch (error) {
    console.error("Error sending email verification mail", error);
  }
};
