import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Company from "../models/company";
import { sendEmailVerificationLink } from "../utils/emailSender";
import { sendSmsOtp } from "../utils/smsSender";

const router = express.Router();

const generateJwt = (companyId: string) => {
  return jwt.sign({ companyId }, process.env.AUTH_SECRET || "secret", {
    expiresIn: "1h", 
  });
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

router.post("/register", async (req: Request, res: Response) => {
  const { companyName, email, mobile, name, employeSize } = req.body;

  const emailOtp = generateOtp();
  const mobileOtp = generateOtp();

  const company = new Company({
    companyName,
    email,
    mobile,
    name,
    employeSize,
    emailOtp,
    mobileOtp,
    emailVerified: false,
    mobileVerified: false,
    verified: false,
  });

  await company.save();

  try {
    await sendEmailVerificationLink({ email, otp: emailOtp });
    await sendSmsOtp({ mobile, otp: mobileOtp }); 
    res.send("Company registered. OTPs have been sent to your email and mobile.");
  } catch (error) {
    res.status(500).json({ error: "Failed to send verification OTPs" });
  }
});

//@ts-ignore
router.post("/verify-email", async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    const company = await Company.findOne({ email });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    if (company.emailOtp === otp) {
      company.emailVerified = true; 
      if (company.mobileVerified || company.emailVerified) {
        company.verified = true; // Mark the company as verified if either email or mobile is verified
      }
      await company.save();

      //@ts-ignore
      const token = generateJwt(company._id.toString()); 
      return res.json({ message: "Email verified and auto-logged in", token });
    } else {
      res.status(400).json({ error: "Invalid OTP" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred during email verification" });
  }
});

//@ts-ignore
router.post("/verify-mobile", async (req: Request, res: Response) => {
  const { mobile, otp } = req.body;

  try {
    const company = await Company.findOne({ mobile });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    if (company.mobileOtp === otp) {
      company.mobileVerified = true; 
      if (company.emailVerified || company.mobileVerified) {
        company.verified = true; // Mark the company as verified if either mobile or email is verified
      }
      await company.save();

      //@ts-ignore
      const token = generateJwt(company._id.toString()); 
      return res.json({ message: "Mobile verified and auto-logged in", token });
    } else {
      res.status(400).json({ error: "Invalid OTP" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred during mobile verification" });
  }
});

export { router as authRouter };
