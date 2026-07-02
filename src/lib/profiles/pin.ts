import { createHash, randomBytes } from "node:crypto";

const MIN_LENGTH = 4;
const MAX_LENGTH = 5;
const SALT_LENGTH = 16;

export function isValidPin(pin: string) {
  return pin.length >= MIN_LENGTH && pin.length <= MAX_LENGTH && /^\d+$/.test(pin);
}

export function formatPinInput(input: string) {
  return input.replace(/\D/g, "").slice(0, MAX_LENGTH);
}

export function hashPin(pin: string) {
  if (!isValidPin(pin)) throw new Error("PIN invalide");
  const salt = randomBytes(SALT_LENGTH);
  const hash = createHash("sha256").update(salt).update(pin, "utf8").digest();
  return `${salt.toString("base64")}$${hash.toString("base64")}`;
}

export function verifyPin(inputPin: string, storedHashedPin: string | null | undefined) {
  if (!storedHashedPin || !isValidPin(inputPin)) return false;
  try {
    const [saltB64, hashB64] = storedHashedPin.split("$");
    if (!saltB64 || !hashB64) return false;
    const salt = Buffer.from(saltB64, "base64");
    const storedHash = Buffer.from(hashB64, "base64");
    const inputHash = createHash("sha256").update(salt).update(inputPin, "utf8").digest();
    return inputHash.equals(storedHash);
  } catch {
    return false;
  }
}
