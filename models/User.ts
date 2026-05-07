import mongoose, { Model, Query, Schema } from "mongoose";

export type UserRole = "superadmin" | "admin" | "user";

interface AccessControl {
  module: string;
  level: "admin_only" | "specific_users" | "all_users";
}

export interface UserDocument extends mongoose.Document {
  name: string;
  email: string;
  passwordHash: string;
  mobile: string;
  role: UserRole;
  isActive: boolean;
  accessControl: AccessControl[];
  companyId: mongoose.Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const accessControlSchema = new Schema<AccessControl>(
  {
    module: { type: String, required: true, trim: true },
    level: {
      type: String,
      required: true,
      enum: ["admin_only", "specific_users", "all_users"]
    }
  },
  { _id: false }
);

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    mobile: { type: String, required: true, trim: true },
    role: { type: String, required: true, enum: ["superadmin", "admin", "user"] },
    isActive: { type: Boolean, default: true },
    accessControl: { type: [accessControlSchema], default: [] },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

async function preventSuperAdminDelete(this: Query<unknown, UserDocument>) {
  const filter = this.getFilter();
  const target = await this.model.findOne(filter).select("role");
  if (target?.role === "superadmin") {
    throw new Error("Superadmin cannot be deleted");
  }
}

userSchema.pre("findOneAndDelete", preventSuperAdminDelete);
userSchema.pre("deleteOne", { document: false, query: true }, preventSuperAdminDelete);

const User: Model<UserDocument> = mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);

export default User;
