import crypto from "crypto";
import { env } from "../config/env";

const ALGO = "aes-256-gcm";

/**
 * Encrypts a string (e.g. an OAuth refresh token) for storage at rest.
 * Returns iv:authTag:ciphertext, all hex-encoded, joined with ':'.
 */
export function encrypt(plainText: string): string {
  const key = Buffer.from(env.encryptionKey.padEnd(64, "0").slice(0, 64), "hex");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(":");
}

export function decrypt(payload: string): string {
  const [ivHex, tagHex, dataHex] = payload.split(":");
  const key = Buffer.from(env.encryptionKey.padEnd(64, "0").slice(0, 64), "hex");
  const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]);
  return decrypted.toString("utf8");
}
