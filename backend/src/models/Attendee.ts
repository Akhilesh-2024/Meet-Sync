import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAttendee extends Document {
  meetingId: Types.ObjectId;
  userId?: Types.ObjectId;
  email: string;
  responseStatus: "PENDING" | "ACCEPTED" | "DECLINED";
}

const AttendeeSchema = new Schema<IAttendee>({
  meetingId: { type: Schema.Types.ObjectId, ref: "Meeting", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  email: { type: String, required: true, lowercase: true, trim: true },
  responseStatus: { type: String, enum: ["PENDING", "ACCEPTED", "DECLINED"], default: "PENDING" },
});

AttendeeSchema.index({ meetingId: 1 });
AttendeeSchema.index({ userId: 1 });

export const Attendee = mongoose.model<IAttendee>("Attendee", AttendeeSchema);
