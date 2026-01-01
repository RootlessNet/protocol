/**
 * RootlessNet Authenticated Encryption
 * XChaCha20-Poly1305 for all symmetric encryption
 */

import { xchacha20poly1305 } from "@noble/ciphers/chacha";
import type { EncryptedData, Nonce } from "./types.js";
import { generateNonce, getRandomBytes } from "./random.js";

/** XChaCha20-Poly1305 key size in bytes */
export const KEY_SIZE = 32;

/** XChaCha20-Poly1305 nonce size in bytes */
export const NONCE_SIZE = 24;

/** Poly1305 authentication tag size in bytes */
export const TAG_SIZE = 16;

/**
 * Encrypt data using XChaCha20-Poly1305 (AEAD)
 * @param key - 32-byte encryption key
 * @param plaintext - Data to encrypt
 * @param nonce - Optional 24-byte nonce (generated if not provided)
 * @param associatedData - Optional additional authenticated data
 * @returns Encrypted data with nonce
 */
export function encrypt(
  key: Uint8Array,
  plaintext: Uint8Array,
  nonce?: Nonce,
  associatedData?: Uint8Array
): EncryptedData {
  if (key.length !== KEY_SIZE) {
    throw new Error(`Key must be ${KEY_SIZE} bytes`);
  }

  const actualNonce = nonce ?? generateNonce();

  if (actualNonce.length !== NONCE_SIZE) {
    throw new Error(`Nonce must be ${NONCE_SIZE} bytes`);
  }

  const cipher = xchacha20poly1305(key, actualNonce, associatedData);
  const ciphertext = cipher.encrypt(plaintext);

  return {
    ciphertext,
    nonce: actualNonce,
  };
}

/**
 * Decrypt data using XChaCha20-Poly1305 (AEAD)
 * @param key - 32-byte encryption key
 * @param ciphertext - Data to decrypt (includes auth tag)
 * @param nonce - 24-byte nonce used during encryption
 * @param associatedData - Optional additional authenticated data
 * @returns Decrypted data
 * @throws Error if authentication fails
 */
export function decrypt(
  key: Uint8Array,
  ciphertext: Uint8Array,
  nonce: Nonce,
  associatedData?: Uint8Array
): Uint8Array {
  if (key.length !== KEY_SIZE) {
    throw new Error(`Key must be ${KEY_SIZE} bytes`);
  }

  if (nonce.length !== NONCE_SIZE) {
    throw new Error(`Nonce must be ${NONCE_SIZE} bytes`);
  }

  const cipher = xchacha20poly1305(key, nonce, associatedData);
  return cipher.decrypt(ciphertext);
}

/**
 * Encrypt and return combined nonce + ciphertext
 */
export function encryptCombined(
  key: Uint8Array,
  plaintext: Uint8Array,
  associatedData?: Uint8Array
): Uint8Array {
  const { ciphertext, nonce } = encrypt(
    key,
    plaintext,
    undefined,
    associatedData
  );

  const combined = new Uint8Array(NONCE_SIZE + ciphertext.length);
  combined.set(nonce, 0);
  combined.set(ciphertext, NONCE_SIZE);

  return combined;
}

/**
 * Decrypt from combined nonce + ciphertext format
 */
export function decryptCombined(
  key: Uint8Array,
  combined: Uint8Array,
  associatedData?: Uint8Array
): Uint8Array {
  if (combined.length < NONCE_SIZE + TAG_SIZE) {
    throw new Error("Invalid ciphertext length");
  }

  const nonce = combined.slice(0, NONCE_SIZE);
  const ciphertext = combined.slice(NONCE_SIZE);

  return decrypt(key, ciphertext, nonce, associatedData);
}

/**
 * Try to decrypt, returning null on failure instead of throwing
 */
export function tryDecrypt(
  key: Uint8Array,
  ciphertext: Uint8Array,
  nonce: Nonce,
  associatedData?: Uint8Array
): Uint8Array | null {
  try {
    return decrypt(key, ciphertext, nonce, associatedData);
  } catch {
    return null;
  }
}
