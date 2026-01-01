/**
 * RootlessNet Cryptographic Types
 * Core type definitions for all cryptographic operations
 */

/** 32-byte array for keys and hashes */
export type Bytes32 = Uint8Array;

/** 64-byte array for signatures */
export type Bytes64 = Uint8Array;

/** 24-byte array for nonces */
export type Nonce = Uint8Array;

/** Ed25519 keypair for signing */
export interface SigningKeyPair {
  publicKey: Bytes32;
  privateKey: Bytes64;
}

/** X25519 keypair for encryption */
export interface EncryptionKeyPair {
  publicKey: Bytes32;
  privateKey: Bytes32;
}

/** Complete identity keyset */
export interface KeySet {
  signing: SigningKeyPair;
  encryption: EncryptionKeyPair;
}

/** Encrypted data with nonce */
export interface EncryptedData {
  ciphertext: Uint8Array;
  nonce: Nonce;
}

/** Sealed box for anonymous encryption */
export interface SealedBox {
  ephemeralPublic: Bytes32;
  ciphertext: Uint8Array;
  nonce: Nonce;
}

/** Multi-recipient encrypted payload */
export interface MultiRecipientPayload {
  ephemeralPublic: Bytes32;
  recipients: RecipientKey[];
  ciphertext: Uint8Array;
  nonce: Nonce;
}

/** Per-recipient encrypted key */
export interface RecipientKey {
  recipientPublicKey: Bytes32;
  encryptedKey: Uint8Array;
  nonce: Nonce;
}

/** HKDF parameters */
export interface HKDFParams {
  salt?: Uint8Array;
  info: string;
  length: number;
}

/** Argon2id parameters for password hashing */
export interface Argon2Params {
  memoryCost: number;
  timeCost: number;
  parallelism: number;
  hashLength: number;
  salt: Uint8Array;
}

/** Default Argon2id parameters (secure defaults) */
export const DEFAULT_ARGON2_PARAMS: Omit<Argon2Params, "salt"> = {
  memoryCost: 262144, // 256 MB
  timeCost: 3,
  parallelism: 4,
  hashLength: 32,
};

/** Signature with metadata */
export interface Signature {
  algorithm: "ed25519";
  publicKey: Bytes32;
  signature: Bytes64;
  timestamp: number;
}

/** Content Identifier */
export interface CID {
  version: 1;
  codec: number;
  hash: Uint8Array;
  toString(): string;
}

/** Result of encryption operation */
export interface EncryptionResult {
  ciphertext: Uint8Array;
  nonce: Nonce;
  tag?: Uint8Array;
}

/** Verification result */
export interface VerificationResult {
  valid: boolean;
  error?: string;
}
