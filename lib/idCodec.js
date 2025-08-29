import crypto from "crypto";
import mongoose from "mongoose";

const ENCRYPTION_KEY_HEX = process.env.ENCRYPTION_KEY;
const IV_HEX = process.env.ENCRYPTION_IV;

const ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_HEX, "hex");
const IV = Buffer.from(IV_HEX, "hex");
const algorithm = "aes-256-cbc";

// ✅ Base64 to Base64URL
function base64ToUrlSafe(base64) {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ✅ Base64URL to Base64
function urlSafeToBase64(urlSafe) {
  let base64 = urlSafe.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  return base64;
}

export function encodeObjectId(id) {
  const text = id.toString();
  const cipher = crypto.createCipheriv(algorithm, ENCRYPTION_KEY, IV);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");

  return base64ToUrlSafe(encrypted); 
}

export function decodeObjectId(encodedId) {
  const base64 = urlSafeToBase64(encodedId); 
  const decipher = crypto.createDecipheriv(algorithm, ENCRYPTION_KEY, IV);
  let decrypted = decipher.update(base64, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return new mongoose.Types.ObjectId(decrypted);
}
