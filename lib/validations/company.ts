import { z } from "zod";

const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const pincodeRegex = /^[0-9]{6}$/;
const indianPhoneRegex = /^[6-9][0-9]{9}$/;

export const companySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  logo: z.string().url().optional().or(z.literal("")),
  industry: z.string().min(1, "Industry is required"),
  companyType: z.string().min(1, "Company type is required"),
  gst: z.string().regex(gstRegex, "Invalid GST number").optional().or(z.literal("")),
  pan: z.string().regex(panRegex, "Invalid PAN number"),
  cin: z.string().optional().or(z.literal("")),
  financialYearStart: z.string().min(1, "Financial year start is required"),
  address: z.string().min(2, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(pincodeRegex, "Pincode must be 6 digits"),
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(indianPhoneRegex, "Phone must be a valid 10-digit Indian number"),
  website: z.string().url("Website must be a valid URL").optional().or(z.literal("")),
  invoicePrefix: z.string().min(1, "Invoice prefix is required"),
  currency: z.string().min(1, "Currency is required"),
  timezone: z.string().min(1, "Timezone is required"),
  dateFormat: z.string().min(1, "Date format is required")
});

export type CompanyInput = z.infer<typeof companySchema>;
