import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISlot {
  start: Date;
  end: Date;
}

export interface IMeeting extends Document {
  organizerId: Types.ObjectId;
  title: string;
  description?: string;
  duration: number; // minutes
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  suggestedSlots: ISlot[];
  finalSlot?: ISlot;
  createdAt: Date;
}

const SlotSchema = new Schema<ISlot>(
  { start: { type: Date, required: true }, end: { type: Date, required: true } },
  { _id: false }
);

const MeetingSchema = new Schema<IMeeting>(
  {
    organizerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    duration: { type: Number, required: true },
    status: { type: String, enum: ["PENDING", "CONFIRMED", "CANCELLED"], default: "PENDING" },
    suggestedSlots: { type: [SlotSchema], default: [] },
    finalSlot: { type: SlotSchema },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

MeetingSchema.index({ organizerId: 1, createdAt: -1 });

export const Meeting = mongoose.model<IMeeting>("Meeting", MeetingSchema);
