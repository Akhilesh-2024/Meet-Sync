/**
 * CalendarService — abstracts the calendar provider behind a small interface
 * (Interface Segregation) so Outlook/other providers can be added later
 * without touching SchedulerService or controllers.
 *
 * MockCalendarProvider lets the whole app run and be demoed with zero external
 * credentials. GoogleCalendarProvider is a real implementation you can enable
 * by setting GOOGLE_CLIENT_ID/SECRET in .env (see README).
 */
import { google } from "googleapis";
import { env } from "../config/env";
import { CalendarCache } from "../models/CalendarCache";
import { OAuthToken } from "../models/OAuthToken";
import { decrypt, encrypt } from "../utils/encryption";
import { BusyPeriod } from "./scheduler.service";
import { Types } from "mongoose";

export interface CalendarProvider {
  getBusyPeriods(userId: string, rangeStart: Date, rangeEnd: Date): Promise<BusyPeriod[]>;
}

/** Deterministic pseudo-random busy blocks, so demos are repeatable per user. */
class MockCalendarProvider implements CalendarProvider {
  async getBusyPeriods(userId: string, rangeStart: Date, rangeEnd: Date): Promise<BusyPeriod[]> {
    const seed = [...userId].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const periods: BusyPeriod[] = [];
    const dayMs = 24 * 60 * 60 * 1000;
    let cursor = new Date(rangeStart);
    let i = 0;
    while (cursor.getTime() < rangeEnd.getTime()) {
      const dayStart = new Date(cursor);
      dayStart.setUTCHours(0, 0, 0, 0);
      const offsetHour = 9 + ((seed + i) % 6); // busy block starts between 09:00-15:00 UTC
      const busyStart = new Date(dayStart.getTime() + offsetHour * 60 * 60 * 1000);
      const busyEnd = new Date(busyStart.getTime() + 60 * 60 * 1000); // 1hr block
      if (busyStart.getTime() < rangeEnd.getTime() && busyEnd.getTime() > rangeStart.getTime()) {
        periods.push({ start: busyStart, end: busyEnd });
      }
      cursor = new Date(cursor.getTime() + dayMs);
      i++;
    }
    return periods;
  }
}

class GoogleCalendarProvider implements CalendarProvider {
  async getBusyPeriods(userId: string, rangeStart: Date, rangeEnd: Date): Promise<BusyPeriod[]> {
    // Cache-aside: check calendar_cache first
    const cached = await CalendarCache.find({
      userId,
      startTime: { $lt: rangeEnd },
      endTime: { $gt: rangeStart },
    }).lean();
    if (cached.length > 0) {
      return cached.map((c) => ({ start: c.startTime, end: c.endTime }));
    }

    const tokenDoc = await OAuthToken.findOne({ userId, provider: "GOOGLE" });
    if (!tokenDoc) {
      throw new Error("No connected Google Calendar for this user");
    }

    const oauth2Client = new google.auth.OAuth2(env.google.clientId, env.google.clientSecret, env.google.redirectUri);
    oauth2Client.setCredentials({
      access_token: decrypt(tokenDoc.accessToken),
      refresh_token: decrypt(tokenDoc.refreshToken),
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const res = await calendar.freebusy.query({
      requestBody: {
        timeMin: rangeStart.toISOString(),
        timeMax: rangeEnd.toISOString(),
        items: [{ id: "primary" }],
      },
    });

    const busy = res.data.calendars?.primary?.busy ?? [];
    const periods: BusyPeriod[] = busy
      .filter((b) => b.start && b.end)
      .map((b) => ({ start: new Date(b.start as string), end: new Date(b.end as string) }));

    // Populate cache
    if (periods.length > 0) {
      await CalendarCache.insertMany(
        periods.map((p) => ({
          userId: new Types.ObjectId(userId),
          eventId: `${userId}-${p.start.toISOString()}`,
          summary: "Busy",
          startTime: p.start,
          endTime: p.end,
          isBusy: true,
          syncedAt: new Date(),
        })),
        { ordered: false }
      ).catch(() => undefined); // ignore duplicate key races
    }

    return periods;
  }
}

export function getCalendarProvider(): CalendarProvider {
  if (env.google.clientId && env.google.clientSecret) {
    return new GoogleCalendarProvider();
  }
  return new MockCalendarProvider();
}

export function buildGoogleOAuthClient() {
  return new google.auth.OAuth2(env.google.clientId, env.google.clientSecret, env.google.redirectUri);
}

export async function storeGoogleTokens(userId: string, tokens: { access_token?: string | null; refresh_token?: string | null; expiry_date?: number | null; scope?: string | null }) {
  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error("Google did not return the expected tokens (ensure access_type=offline & prompt=consent)");
  }
  await OAuthToken.findOneAndUpdate(
    { userId, provider: "GOOGLE" },
    {
      userId,
      provider: "GOOGLE",
      accessToken: encrypt(tokens.access_token),
      refreshToken: encrypt(tokens.refresh_token),
      expiryDate: new Date(tokens.expiry_date || Date.now() + 3600 * 1000),
      scope: tokens.scope || "",
    },
    { upsert: true, new: true }
  );
}
