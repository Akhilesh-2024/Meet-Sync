import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  displayName: string;
  timezone: string;
  authProvider: "GOOGLE" | "EMAIL";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    displayName: { type: String, required: true },
    timezone: { type: String, default: "UTC" },
    authProvider: { type: String, enum: ["GOOGLE", "EMAIL"], default: "EMAIL" },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
