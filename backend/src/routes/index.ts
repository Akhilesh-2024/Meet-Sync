import { Router } from "express";
import authRoutes from "./authRoutes";
import calendarRoutes from "./calendarRoutes";
import schedulingRoutes from "./schedulingRoutes";

const router = Router();
router.use("/auth", authRoutes);
router.use("/calendar", calendarRoutes);
router.use("/", schedulingRoutes); // exposes /suggest, /book, /meetings per API spec

export default router;
