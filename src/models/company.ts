import mongoose, { Schema, Document } from "mongoose";

interface ICompany extends Document {
  companyName: string;
  email: string;
  mobile: string;
  name: string;
  employeSize: string;
  verified: boolean;             
  emailOtp?: string;             
  mobileOtp?: string;            
  emailVerified: boolean;      
  mobileVerified: boolean;       
}

const companySchema: Schema = new mongoose.Schema({
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

export default mongoose.model<ICompany>("Company", companySchema);
