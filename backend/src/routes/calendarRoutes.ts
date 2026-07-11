import { Router } from "express";
import { getAvailability, googleAuthUrl, googleAuthCallback } from "../controllers/calendarController";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.get("/availability", requireAuth, getAvailability);
router.get("/google/url", requireAuth, googleAuthUrl);
router.get("/google/callback", googleAuthCallback); // Google redirects here without our Authorization header

export default router;
