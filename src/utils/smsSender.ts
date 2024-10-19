import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID || ""; 
const authToken = process.env.TWILIO_AUTH_TOKEN || "";   
const client = twilio(accountSid, authToken);

export const sendSmsOtp = async ({
  mobile,
  otp,
}: {
  mobile: string;
  otp: string;
}) => {
  try {
    const message = await client.messages.create({
      body: `Your verification OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER, 
      to: mobile, 
    });
    console.log("OTP sent successfully:", message.sid);
    return message.sid;
  } catch (error) {
    console.error("Failed to send OTP via SMS", error);
    throw new Error("Failed to send OTP");
  }
};
