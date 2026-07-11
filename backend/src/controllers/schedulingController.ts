import { Response, NextFunction } from "express";
import { AuthedRequest } from "../middleware/auth";
import { getCalendarProvider } from "../services/calendar.service";
import { findAvailableSlots, findNearestPartialOverlap, BusyPeriod } from "../services/scheduler.service";
import { Meeting } from "../models/Meeting";
import { Attendee } from "../models/Attendee";
import { User } from "../models/User";
import { sendEmail } from "../services/email.service";

export async function suggest(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { attendees, duration, range_start, range_end, title } = req.body as {
      attendees: string[];
      duration: number;
      range_start: string;
      range_end: string;
      title?: string;
    };

    if (!Array.isArray(attendees) || attendees.length === 0) {
      return res.status(400).json({ error: "attendees must be a non-empty array of emails" });
    }
    if (!duration || duration <= 0) return res.status(400).json({ error: "duration (minutes) must be positive" });
    if (!range_start || !range_end) return res.status(400).json({ error: "range_start and range_end are required" });

    const organizer = await User.findById(req.user!.id);
    const rangeStart = new Date(range_start);
    const rangeEnd = new Date(range_end);
    const provider = getCalendarProvider();

    // Include the organizer's own calendar in the check
    const allEmails = Array.from(new Set([organizer!.email, ...attendees]));
    const attendeeBusyPeriods: Record<string, BusyPeriod[]> = {};

    for (const email of allEmails) {
      const user = await User.findOne({ email: email.toLowerCase() });
      // Attendees without a MeetSync account are assumed free (no calendar to check in MVP)
      if (!user) {
        attendeeBusyPeriods[email] = [];
        continue;
      }
      attendeeBusyPeriods[email] = await provider.getBusyPeriods(user.id, rangeStart, rangeEnd);
    }

    let suggestions = findAvailableSlots({
      attendeeBusyPeriods,
      durationMinutes: duration,
      rangeStart,
      rangeEnd,
      maxSuggestions: 3,
    });

    let fallbackUsed = false;
    if (suggestions.length === 0) {
      const nearest = findNearestPartialOverlap({
        attendeeBusyPeriods,
        durationMinutes: duration,
        rangeStart,
        rangeEnd,
      });
      if (nearest) {
        suggestions = [nearest];
        fallbackUsed = true;
      }
    }

    const meeting = await Meeting.create({
      organizerId: organizer!.id,
      title: title || "New Meeting",
      duration,
      status: "PENDING",
      suggestedSlots: suggestions,
    });

    await Attendee.insertMany(attendees.map((email) => ({ meetingId: meeting.id, email })));

    res.status(200).json({
      meeting_id: meeting.id,
      suggestions,
      fallback_used: fallbackUsed,
    });
  } catch (err) {
    next(err);
  }
}

export async function book(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { meeting_id, slot_index } = req.body as { meeting_id: string; slot_index: number };
    if (!meeting_id || slot_index === undefined) {
      return res.status(400).json({ error: "meeting_id and slot_index are required" });
    }

    const meeting = await Meeting.findById(meeting_id);
    if (!meeting) return res.status(404).json({ error: "Meeting not found" });
    if (meeting.status === "CONFIRMED") {
      return res.status(409).json({ error: "Meeting already confirmed", event_id: meeting.id });
    }
    const slot = meeting.suggestedSlots[slot_index];
    if (!slot) return res.status(400).json({ error: "Invalid slot_index" });

    meeting.finalSlot = slot;
    meeting.status = "CONFIRMED";
    await meeting.save();

    const attendees = await Attendee.find({ meetingId: meeting.id });
    for (const a of attendees) {
      await sendEmail({
        to: a.email,
        subject: `Meeting confirmed: ${meeting.title}`,
        html: `<p>Your meeting "${meeting.title}" is confirmed for ${slot.start.toISOString()} - ${slot.end.toISOString()}.</p>`,
      });
    }

    res.status(201).json({
      event_id: meeting.id,
      invite_link: `${req.protocol}://${req.get("host")}/meetings/${meeting.id}`,
      final_slot: slot,
    });
  } catch (err) {
    next(err);
  }
}

export async function listMeetings(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { status } = req.query as { status?: string };
    const filter: Record<string, unknown> = { organizerId: req.user!.id };
    if (status === "upcoming") filter.status = { $in: ["PENDING", "CONFIRMED"] };
    if (status === "past") filter.status = "CANCELLED";

    const meetings = await Meeting.find(filter).sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ meetings });
  } catch (err) {
    next(err);
  }
}
