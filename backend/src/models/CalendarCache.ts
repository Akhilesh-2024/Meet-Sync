import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICalendarCache extends Document {
  userId: Types.ObjectId;
  eventId: string;
  summary: string;
  startTime: Date;
  endTime: Date;
  isBusy: boolean;
  syncedAt: Date;
}

const CalendarCacheSchema = new Schema<ICalendarCache>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  eventId: { type: String, required: true },
  summary: { type: String, default: "" },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  isBusy: { type: Boolean, default: true },
  syncedAt: { type: Date, default: Date.now },
});

CalendarCacheSchema.index({ userId: 1, startTime: 1 });
// TTL: purge cached events 1 day after they were synced, forcing a refresh
CalendarCacheSchema.index({ syncedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

export const CalendarCache = mongoose.model<ICalendarCache>("CalendarCache", CalendarCacheSchema);
