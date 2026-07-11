import mongoose, { Schema, Document, Types } from "mongoose";

export interface IOAuthToken extends Document {
  userId: Types.ObjectId;
  provider: "GOOGLE";
  accessToken: string; // encrypted at rest
  refreshToken: string; // encrypted at rest
  expiryDate: Date;
  scope: string;
  createdAt: Date;
}

const OAuthTokenSchema = new Schema<IOAuthToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: String, enum: ["GOOGLE"], default: "GOOGLE" },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    scope: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const OAuthToken = mongoose.model<IOAuthToken>("OAuthToken", OAuthTokenSchema);
