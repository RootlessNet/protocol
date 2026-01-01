/**
 * RootlessNet Digital Signatures
 * Ed25519 for all signing operations
 */

import { ed25519 } from "@noble/curves/ed25519";
import type { SigningKeyPair, Signature, VerificationResult } from "./types.js";
import { getRandomBytes } from "./random.js";
import { hash } from "./hash.js";

/**
 * Generate a new Ed25519 signing keypair
 */
export function generateSigningKeyPair(): SigningKeyPair {
  const privateKey = ed25519.utils.randomPrivateKey();
  const publicKey = ed25519.getPublicKey(privateKey);

  // Ed25519 private key is 64 bytes (seed + derived)
  const fullPrivateKey = new Uint8Array(64);
  fullPrivateKey.set(privateKey, 0);
  fullPrivateKey.set(publicKey, 32);

  return {
    publicKey,
    privateKey: fullPrivateKey,
  };
}

/**
 * Derive signing keypair from a 32-byte seed
 */
export function signingKeyPairFromSeed(seed: Uint8Array): SigningKeyPair {
  if (seed.length !== 32) {
    throw new Error("Seed must be 32 bytes");
  }

  const publicKey = ed25519.getPublicKey(seed);
  const fullPrivateKey = new Uint8Array(64);
  fullPrivateKey.set(seed, 0);
  fullPrivateKey.set(publicKey, 32);

  return {
    publicKey,
    privateKey: fullPrivateKey,
  };
}

/**
 * Sign a message with Ed25519
 * @param privateKey - 32 or 64 byte private key
 * @param message - Message to sign
 * @returns 64-byte signature
 */
export function sign(privateKey: Uint8Array, message: Uint8Array): Uint8Array {
  // Extract seed if full private key provided
  const seed = privateKey.length === 64 ? privateKey.slice(0, 32) : privateKey;
  return ed25519.sign(message, seed);
}

/**
 * Sign data with hash-then-sign
 * Hashes the data first, then signs the hash
 */
export function signHash(privateKey: Uint8Array, data: Uint8Array): Uint8Array {
  const messageHash = hash(data);
  return sign(privateKey, messageHash);
}

/**
 * Verify an Ed25519 signature
 */
export function verify(
  publicKey: Uint8Array,
  message: Uint8Array,
  signature: Uint8Array
): boolean {
  try {
    return ed25519.verify(signature, message, publicKey);
  } catch {
    return false;
  }
}

/**
 * Verify a hash-then-sign signature
 */
export function verifyHash(
  publicKey: Uint8Array,
  data: Uint8Array,
  signature: Uint8Array
): boolean {
  const messageHash = hash(data);
  return verify(publicKey, messageHash, signature);
}

/**
 * Create a complete signature object with metadata
 */
export function createSignature(
  privateKey: Uint8Array,
  publicKey: Uint8Array,
  data: Uint8Array
): Signature {
  const signatureBytes = signHash(privateKey, data);

  return {
    algorithm: "ed25519",
    publicKey: new Uint8Array(publicKey),
    signature: signatureBytes,
    timestamp: Date.now(),
  };
}

/**
 * Verify a complete signature object
 */
export function verifySignature(
  signature: Signature,
  data: Uint8Array
): VerificationResult {
  if (signature.algorithm !== "ed25519") {
    return { valid: false, error: "Unsupported algorithm" };
  }

  const valid = verifyHash(signature.publicKey, data, signature.signature);

  return valid ? { valid: true } : { valid: false, error: "Invalid signature" };
}

/**
 * Get the public key from a private key
 */
export function getPublicKey(privateKey: Uint8Array): Uint8Array {
  const seed = privateKey.length === 64 ? privateKey.slice(0, 32) : privateKey;
  return ed25519.getPublicKey(seed);
}

export { ed25519 };
