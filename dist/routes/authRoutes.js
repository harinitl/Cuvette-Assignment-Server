"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const company_1 = __importDefault(require("../models/company"));
const emailSender_1 = require("../utils/emailSender");
const smsSender_1 = require("../utils/smsSender");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = express_1.default.Router();
exports.authRouter = router;
const generateJwt = (companyId) => {
    return jsonwebtoken_1.default.sign({ companyId }, process.env.AUTH_SECRET || "secret", {
        expiresIn: "1h",
    });
};
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { companyName, email, mobile, name, employeSize } = req.body;
    const emailOtp = generateOtp();
    const mobileOtp = generateOtp();
    const company = new company_1.default({
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
    yield company.save();
    let emailSent = false;
    let smsSent = false;
    try {
        yield (0, emailSender_1.sendEmailVerificationLink)({ email, otp: emailOtp });
        emailSent = true;
    }
    catch (error) {
        console.error("Failed to send email OTP:", error);
    }
    try {
        yield (0, smsSender_1.sendSmsOtp)({ mobile, otp: mobileOtp });
        smsSent = true;
    }
    catch (error) {
        console.error("Failed to send SMS OTP:", error);
    }
    if (emailSent || smsSent) {
        res
            .status(200)
            .send("Company registered. OTP(s) have been sent to your email or mobile.");
    }
    else {
        res
            .status(500)
            .json({
            error: "Failed to send verification OTPs to both email and mobile.",
        });
    }
}));
//@ts-ignore
router.post("/verify-email", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    try {
        const company = yield company_1.default.findOne({ email });
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }
        if (company.emailOtp === otp) {
            company.emailVerified = true;
            if (company.mobileVerified || company.emailVerified) {
                company.verified = true;
            }
            yield company.save();
            //@ts-ignore
            const token = generateJwt(company._id.toString());
            return res.json({ message: "Email verified and auto-logged in", token });
        }
        else {
            res.status(400).json({ error: "Invalid OTP" });
        }
    }
    catch (error) {
        res
            .status(500)
            .json({ error: "An error occurred during email verification" });
    }
}));
//@ts-ignore
router.post("/verify-mobile", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { mobile, otp } = req.body;
    try {
        const company = yield company_1.default.findOne({ mobile });
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }
        if (company.mobileOtp === otp) {
            company.mobileVerified = true;
            if (company.emailVerified || company.mobileVerified) {
                company.verified = true; // Mark the company as verified if either mobile or email is verified
            }
            yield company.save();
            //@ts-ignore
            const token = generateJwt(company._id.toString());
            return res.json({ message: "Mobile verified and auto-logged in", token });
        }
        else {
            res.status(400).json({ error: "Invalid OTP" });
        }
    }
    catch (error) {
        res
            .status(500)
            .json({ error: "An error occurred during mobile verification" });
    }
}));
//@ts-ignore
router.get("/userInfo", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const company = yield company_1.default.findById(req === null || req === void 0 ? void 0 : req.company);
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }
        res.status(200).json(company); // Return company details excluding OTPs
    }
    catch (error) {
        res.status(500).json({ error: "An error occurred while fetching user info" });
    }
}));
