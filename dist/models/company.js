"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const companySchema = new mongoose_1.default.Schema({
    companyName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    mobile: { type: String, required: true },
    employeSize: { type: String, required: true },
    name: { type: String, required: true },
    verified: { type: Boolean, default: false },
    emailOtp: { type: String },
    mobileOtp: { type: String },
    emailVerified: { type: Boolean, default: false },
    mobileVerified: { type: Boolean, default: false },
});
exports.default = mongoose_1.default.model("Company", companySchema);
