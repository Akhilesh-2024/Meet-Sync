import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser } from "../services/auth.service";
import { verifyRefreshToken, signAccessToken } from "../utils/jwt";
import { User } from "../models/User";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name, timezone } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "email, password and name are required" });
    }
    const tokens = await registerUser(email, password, name, timezone);
    const user = await User.findOne({ email: email.toLowerCase() }).select("-passwordHash");
    res.status(201).json({ ...tokens, user });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }
    const tokens = await loginUser(email, password);
    const user = await User.findOne({ email: email.toLowerCase() }).select("-passwordHash");
    res.status(200).json({ ...tokens, user });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(400).json({ error: "refresh_token is required" });
    const payload = verifyRefreshToken(refresh_token);
    const newToken = signAccessToken({ sub: payload.sub, email: payload.email });
    res.status(200).json({ new_token: newToken });
  } catch {
    res.status(403).json({ error: "Invalid or expired refresh token" });
  }
}

export async function me(req: Request & { user?: { id: string } }, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user!.id).select("-passwordHash");
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}
