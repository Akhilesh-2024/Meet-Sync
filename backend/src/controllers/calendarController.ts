import { Response, NextFunction } from "express";
import { AuthedRequest } from "../middleware/auth";
import { getCalendarProvider, buildGoogleOAuthClient, storeGoogleTokens } from "../services/calendar.service";
import { env } from "../config/env";

export async function getAvailability(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { start, end } = req.query as { start?: string; end?: string };
    if (!start || !end) return res.status(400).json({ error: "start and end query params are required (ISO 8601)" });

    const provider = getCalendarProvider();
    const busy = await provider.getBusyPeriods(req.user!.id, new Date(start), new Date(end));
    res.status(200).json({ busy });
  } catch (err) {
    next(err);
  }
}

export function googleAuthUrl(req: AuthedRequest, res: Response) {
  if (!env.google.clientId) {
    return res.status(400).json({ error: "Google OAuth is not configured on this server. Set GOOGLE_CLIENT_ID/SECRET." });
  }
  const client = buildGoogleOAuthClient();
  const url = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar.readonly", "https://www.googleapis.com/auth/calendar.events"],
    state: req.user!.id, // used to associate the callback with the logged-in user
  });
  res.status(200).json({ url });
}

export async function googleAuthCallback(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { code, state } = req.query as { code?: string; state?: string };
    if (!code || !state) return res.status(400).json({ error: "Missing code or state" });
    const client = buildGoogleOAuthClient();
    const { tokens } = await client.getToken(code);
    await storeGoogleTokens(state, tokens);
    res.redirect(`${env.clientUrl}/dashboard?calendar=connected`);
  } catch (err) {
    next(err);
  }
}
