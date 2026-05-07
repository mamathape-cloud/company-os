import mongoose, { Model, Schema } from "mongoose";

export interface CompanyDocument extends mongoose.Document {
  name: string;
  logo?: string;
  industry: string;
  companyType: string;
  gst?: string;
  pan: string;
  cin?: string;
  financialYearStart: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  email: string;
  phone: string;
  website?: string;
  invoicePrefix: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<CompanyDocument>(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String },
    industry: { type: String, required: true, trim: true },
    companyType: { type: String, required: true, trim: true },
    gst: { type: String, trim: true },
    pan: { type: String, required: true, trim: true, uppercase: true },
    cin: { type: String, trim: true },
    financialYearStart: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    website: { type: String, trim: true },
    invoicePrefix: { type: String, required: true, trim: true, default: "INV-" },
    currency: { type: String, required: true, trim: true, default: "INR" },
    timezone: { type: String, required: true, trim: true, default: "Asia/Kolkata" },
    dateFormat: { type: String, required: true, trim: true, default: "DD/MM/YYYY" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

const Company: Model<CompanyDocument> =
  mongoose.models.Company || mongoose.model<CompanyDocument>("Company", companySchema);

export default Company;
