// src/lib/tokens.ts
import crypto from "crypto";

export function randomTokenHex(len = 32) {
  return crypto.randomBytes(len).toString("hex");
}
