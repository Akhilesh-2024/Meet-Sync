import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { signAccessToken, signRefreshToken } from "../utils/jwt";

const SALT_ROUNDS = 12;

export async function registerUser(email: string, password: string, displayName: string, timezone = "UTC") {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw Object.assign(new Error("Email already registered"), { status: 400 });
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ email, passwordHash, displayName, timezone, authProvider: "EMAIL" });
  return issueTokens(user.id, user.email);
}

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.passwordHash) {
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  }
  return issueTokens(user.id, user.email);
}

function issueTokens(userId: string, email: string) {
  const accessToken = signAccessToken({ sub: userId, email });
  const refreshToken = signRefreshToken({ sub: userId, email });
  return { accessToken, refreshToken };
}
