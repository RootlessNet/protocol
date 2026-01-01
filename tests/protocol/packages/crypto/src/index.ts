/**
 * RootlessNet Crypto Package
 * Core cryptographic primitives for the protocol
 */

// Types
export * from "./types.js";

// Random number generation
export {
  getRandomBytes,
  generateNonce,
  generateKey,
  generateSalt,
  hasSecureRandom,
  generateUUID,
} from "./random.js";

// Hashing
export {
  hash,
  hashWithLength,
  hashConcat,
  keyedHash,
  deriveKey,
  sha256Hash,
  sha512Hash,
  blake3,
  sha256,
  sha512,
} from "./hash.js";

// Digital signatures (Ed25519)
export {
  generateSigningKeyPair,
  signingKeyPairFromSeed,
  sign,
  signHash,
  verify,
  verifyHash,
  createSignature,
  verifySignature,
  getPublicKey,
  ed25519,
} from "./signing.js";

// Authenticated encryption (XChaCha20-Poly1305)
export {
  encrypt,
  decrypt,
  encryptCombined,
  decryptCombined,
  tryDecrypt,
  KEY_SIZE,
  NONCE_SIZE,
  TAG_SIZE,
} from "./encryption.js";

// Key exchange (X25519)
export {
  generateEncryptionKeyPair,
  encryptionKeyPairFromSeed,
  x25519ECDH,
  sealTo,
  unseal,
  encryptToMultiple,
  decryptMultiRecipient,
  x25519,
} from "./keyexchange.js";

// Key derivation
export {
  hkdf,
  deriveKeys,
  deriveKeyFromPassword,
  createArgon2Params,
  kdfChain,
  kdfRootKey,
  KDF_CONTEXT,
} from "./kdf.js";

// Content and identity identifiers
export {
  computeCID,
  parseCID,
  verifyCID,
  createDID,
  parseDID,
  isValidDID,
  isValidCID,
  shortDID,
  shortCID,
  MULTICODEC,
} from "./identifiers.js";

// Secure memory utilities
export {
  zeroize,
  constantTimeEqual,
  constantTimeSelect,
  concat,
  toHex,
  fromHex,
  toBase64,
  fromBase64,
  SecureBuffer,
} from "./utils.js";

/**
 * Generate a complete keyset from a seed
 */
export function generateKeySet(seed?: Uint8Array): import("./types.js").KeySet {
  const {
    signingKeyPairFromSeed,
    generateSigningKeyPair,
  } = require("./signing.js");
  const {
    encryptionKeyPairFromSeed,
    generateEncryptionKeyPair,
  } = require("./keyexchange.js");
  const { hkdf } = require("./kdf.js");
  const { getRandomBytes } = require("./random.js");

  if (seed) {
    if (seed.length !== 32) {
      throw new Error("Seed must be 32 bytes");
    }

    const signingMaterial = hkdf(seed, {
      info: "rootless-signing-key-v2",
      length: 32,
    });
    const encryptionMaterial = hkdf(seed, {
      info: "rootless-encryption-key-v2",
      length: 32,
    });

    return {
      signing: signingKeyPairFromSeed(signingMaterial),
      encryption: encryptionKeyPairFromSeed(encryptionMaterial),
    };
  }

  return {
    signing: generateSigningKeyPair(),
    encryption: generateEncryptionKeyPair(),
  };
}

/**
 * Protocol version
 */
export const PROTOCOL_VERSION = "2.0.0";

/**
 * Crypto library version
 */
export const CRYPTO_VERSION = "2.0.0";
