/**
 * RootlessNet Identity Types
 */

import type { KeySet, Signature } from "@rootlessnet/crypto";

/** Identity types */
export type IdentityType = "ephemeral" | "persistent" | "recoverable";

/** Key purpose */
export type KeyPurpose =
  | "signing"
  | "encryption"
  | "authentication"
  | "delegation";

/** Identity key entry */
export interface IdentityKey {
  id: string;
  type: "Ed25519" | "X25519";
  purpose: KeyPurpose;
  publicKey: Uint8Array;
  created: number;
  expires?: number;
  revoked?: number;
}

/** Identity document (public) */
export interface IdentityDocument {
  version: 2;
  did: string;
  type: IdentityType;
  publicKeys: IdentityKey[];
  created: number;
  updated: number;
  proof: {
    type: "Ed25519Signature2020";
    created: number;
    verificationMethod: string;
    signature: Uint8Array;
  };
}

/** Complete identity with private keys */
export interface Identity {
  did: string;
  type: IdentityType;
  document: IdentityDocument;
  keySet: KeySet;
  created: number;
}

/** Identity creation options */
export interface CreateIdentityOptions {
  type?: IdentityType;
  seed?: Uint8Array;
}

/** Identity export format */
export interface ExportedIdentity {
  version: 2;
  encrypted: boolean;
  data: Uint8Array;
  kdf?: {
    algorithm: "argon2id";
    salt: Uint8Array;
    memoryCost: number;
    timeCost: number;
    parallelism: number;
  };
}

/** Key rotation event */
export interface KeyRotation {
  version: 2;
  type: "key-rotation";
  did: string;
  oldKey: {
    id: string;
    publicKey: Uint8Array;
  };
  newKey: IdentityKey;
  effectiveAt: number;
  oldKeyInvalidAt: number;
  proofs: Signature[];
}

/** Recovery share */
export interface RecoveryShare {
  index: number;
  guardian: string;
  encryptedShare: Uint8Array;
  created: number;
}

/** Recovery configuration */
export interface RecoveryConfig {
  threshold: number;
  total: number;
  guardians: string[];
}

/** Identity verification result */
export interface IdentityVerification {
  valid: boolean;
  errors: string[];
  document?: IdentityDocument;
}
