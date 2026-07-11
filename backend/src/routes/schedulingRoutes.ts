import { Router } from "express";
import { suggest, book, listMeetings } from "../controllers/schedulingController";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.post("/suggest", requireAuth, suggest);
router.post("/book", requireAuth, book);
router.get("/meetings", requireAuth, listMeetings);

export default router;
