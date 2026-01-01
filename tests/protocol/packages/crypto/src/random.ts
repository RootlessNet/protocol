/**
 * RootlessNet Secure Random Number Generation
 * OS-provided CSPRNG only - never use Math.random()
 */

/**
 * Generate cryptographically secure random bytes
 * Uses OS CSPRNG (Web Crypto API or Node crypto)
 */
export function getRandomBytes(length: number): Uint8Array {
  if (length <= 0 || length > 65536) {
    throw new Error("Invalid random bytes length");
  }

  const bytes = new Uint8Array(length);

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    throw new Error("No secure random source available");
  }

  return bytes;
}

/**
 * Generate a random 24-byte nonce for XChaCha20
 */
export function generateNonce(): Uint8Array {
  return getRandomBytes(24);
}

/**
 * Generate a random 32-byte key
 */
export function generateKey(): Uint8Array {
  return getRandomBytes(32);
}

/**
 * Generate a random 16-byte salt for Argon2
 */
export function generateSalt(): Uint8Array {
  return getRandomBytes(16);
}

/**
 * Check if we have access to a secure random source
 */
export function hasSecureRandom(): boolean {
  return (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  );
}

/**
 * Generate a random UUID v4
 */
export function generateUUID(): string {
  const bytes = getRandomBytes(16);

  // Set version (4) and variant (RFC 4122)
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
    12,
    16
  )}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
