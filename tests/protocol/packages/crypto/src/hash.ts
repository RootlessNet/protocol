/**
 * RootlessNet Hashing Functions
 * BLAKE3 for primary hashing, SHA-256 for compatibility
 */

import { blake3 } from "@noble/hashes/blake3";
import { sha256 } from "@noble/hashes/sha256";
import { sha512 } from "@noble/hashes/sha512";

/**
 * Hash data using BLAKE3 (primary hash function)
 * @param data - Data to hash
 * @returns 32-byte hash
 */
export function hash(data: Uint8Array): Uint8Array {
  return blake3(data);
}

/**
 * Hash data using BLAKE3 with custom output length
 * @param data - Data to hash
 * @param length - Output length in bytes
 * @returns Hash of specified length
 */
export function hashWithLength(data: Uint8Array, length: number): Uint8Array {
  return blake3(data, { dkLen: length });
}

/**
 * Hash data using SHA-256 (for compatibility)
 */
export function sha256Hash(data: Uint8Array): Uint8Array {
  return sha256(data);
}

/**
 * Hash data using SHA-512
 */
export function sha512Hash(data: Uint8Array): Uint8Array {
  return sha512(data);
}

/**
 * Hash multiple pieces of data
 */
export function hashConcat(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const combined = new Uint8Array(total);
  let offset = 0;

  for (const part of parts) {
    combined.set(part, offset);
    offset += part.length;
  }

  return hash(combined);
}

/**
 * Create a keyed hash (BLAKE3-MAC)
 */
export function keyedHash(key: Uint8Array, data: Uint8Array): Uint8Array {
  if (key.length !== 32) {
    throw new Error("Key must be 32 bytes");
  }
  return blake3(data, { key });
}

/**
 * Derive key material using BLAKE3 KDF
 */
export function deriveKey(
  context: string,
  keyMaterial: Uint8Array,
  length = 32
): Uint8Array {
  return blake3(keyMaterial, { context, dkLen: length });
}

export { blake3, sha256, sha512 };
