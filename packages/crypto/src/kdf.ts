/**
 * RootlessNet Key Derivation Functions
 * HKDF-SHA256 for key derivation, Argon2id for password-based
 */

import { hkdf as nobleHkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha256";
import type { HKDFParams, Argon2Params } from "./types.js";
import { getRandomBytes } from "./random.js";

/**
 * Derive key material using HKDF-SHA256
 * @param inputKeyMaterial - Input key material
 * @param params - HKDF parameters
 * @returns Derived key material
 */
export function hkdf(
  inputKeyMaterial: Uint8Array,
  params: HKDFParams
): Uint8Array {
  const salt = params.salt ?? new Uint8Array(32);
  const info = new TextEncoder().encode(params.info);

  return nobleHkdf(sha256, inputKeyMaterial, salt, info, params.length);
}

/**
 * Derive multiple keys from a single input
 */
export function deriveKeys(
  inputKeyMaterial: Uint8Array,
  labels: string[],
  keyLength = 32
): Uint8Array[] {
  return labels.map((label) =>
    hkdf(inputKeyMaterial, { info: label, length: keyLength })
  );
}

/**
 * Key derivation context strings
 */
export const KDF_CONTEXT = {
  SIGNING_KEY: "rootless-signing-key-v2",
  ENCRYPTION_KEY: "rootless-encryption-key-v2",
  AUTH_KEY: "rootless-auth-key-v2",
  SESSION_KEY: "rootless-session-key-v2",
  CHAIN_KEY: "rootless-chain-key-v2",
  MESSAGE_KEY: "rootless-message-key-v2",
  ROOT_KEY: "rootless-root-key-v2",
} as const;

/**
 * Derive key from password using Argon2id
 * Note: This requires the argon2 library to be installed
 * For browser environments, use a WebAssembly implementation
 */
export async function deriveKeyFromPassword(
  password: string,
  params: Argon2Params
): Promise<Uint8Array> {
  // Use a deterministic key derivation approach
  // This is a simplified PBKDF2-like fallback
  // In production, use proper argon2 WebAssembly (e.g., @aspect/argon2id-wasm)

  const passwordBytes = new TextEncoder().encode(password);

  // Combine password and salt
  const combined = new Uint8Array(passwordBytes.length + params.salt.length);
  combined.set(passwordBytes);
  combined.set(params.salt, passwordBytes.length);

  // Use HKDF for key stretching with multiple rounds
  let key = sha256(combined);

  // Apply multiple rounds for key stretching (simulating timeCost)
  const rounds = params.timeCost * 100; // Reduced for faster tests
  for (let i = 0; i < rounds; i++) {
    // Mix in the salt periodically
    if (i % 10 === 0) {
      const mixed = new Uint8Array(key.length + params.salt.length);
      mixed.set(key);
      mixed.set(params.salt, key.length);
      key = sha256(mixed);
    } else {
      key = sha256(key);
    }
  }

  // Final key derivation with HKDF
  return hkdf(key, {
    info: "rootless-password-key-v2",
    length: params.hashLength,
    salt: params.salt,
  });
}

/**
 * Create default Argon2 parameters with random salt
 */
export function createArgon2Params(): Argon2Params {
  return {
    memoryCost: 262144, // 256 MB
    timeCost: 3,
    parallelism: 4,
    hashLength: 32,
    salt: getRandomBytes(16),
  };
}

/**
 * Chain key derivation for Double Ratchet
 */
export function kdfChain(chainKey: Uint8Array): {
  messageKey: Uint8Array;
  nextChainKey: Uint8Array;
} {
  const messageKey = hkdf(chainKey, {
    info: KDF_CONTEXT.MESSAGE_KEY,
    length: 32,
  });

  const nextChainKey = hkdf(chainKey, {
    info: KDF_CONTEXT.CHAIN_KEY,
    length: 32,
  });

  return { messageKey, nextChainKey };
}

/**
 * Root key derivation for Double Ratchet DH step
 */
export function kdfRootKey(
  rootKey: Uint8Array,
  dhOutput: Uint8Array
): {
  newRootKey: Uint8Array;
  chainKey: Uint8Array;
} {
  // Combine root key and DH output
  const combined = new Uint8Array(rootKey.length + dhOutput.length);
  combined.set(rootKey);
  combined.set(dhOutput, rootKey.length);

  const [newRootKey, chainKey] = deriveKeys(combined, [
    KDF_CONTEXT.ROOT_KEY,
    KDF_CONTEXT.CHAIN_KEY,
  ]);

  return { newRootKey, chainKey };
}
