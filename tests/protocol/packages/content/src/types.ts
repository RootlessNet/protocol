/**
 * RootlessNet Content Types
 */

/** Content encryption level */
export type EncryptionLevel = "none" | "zone" | "recipients" | "self";

/** Clear payload (unencrypted) */
export interface ClearPayload {
  type: "clear";
  data: Uint8Array;
}

/** Encrypted payload */
export interface EncryptedPayload {
  type: "encrypted";
  algorithm: "xchacha20-poly1305";
  ephemeralPublic?: Uint8Array;
  recipients?: {
    did: string;
    encryptedKey: Uint8Array;
    nonce: Uint8Array;
  }[];
  ciphertext: Uint8Array;
  nonce: Uint8Array;
}

/** Zone encrypted payload */
export interface ZoneEncryptedPayload {
  type: "zone-encrypted";
  zoneId: string;
  epoch: number;
  ciphertext: Uint8Array;
  nonce: Uint8Array;
}

/** Content payload union type */
export type ContentPayload =
  | ClearPayload
  | EncryptedPayload
  | ZoneEncryptedPayload;

/** Content object - the core data structure */
export interface ContentObject {
  version: 2;
  id: string; // CID
  author: string; // DID
  timestamp: number;
  expiresAt?: number;
  zone: string;
  parent?: string; // Parent CID for replies
  thread?: string; // Thread root CID
  mentions: string[]; // DIDs
  contentType: string; // MIME type
  payloadEncryption: EncryptionLevel;
  payload: ContentPayload;
  payloadHash: Uint8Array;
  tags: string[];
  language?: string;
  extensions?: Record<string, unknown>;
  signature: Uint8Array;
}

/** Input for creating content */
export interface CreateContentInput {
  payload: Uint8Array | string;
  contentType?: string;
  zone?: string;
  parent?: string;
  thread?: string;
  mentions?: string[];
  tags?: string[];
  language?: string;
  encryption?: EncryptionLevel;
  recipients?: string[]; // DIDs for recipient encryption
  expiresAt?: number;
  extensions?: Record<string, unknown>;
}

/** Content verification result */
export interface ContentVerification {
  valid: boolean;
  errors: string[];
  content?: ContentObject;
}

/** Content query options */
export interface ContentQuery {
  zone?: string;
  author?: string;
  parent?: string;
  thread?: string;
  tags?: string[];
  since?: number;
  until?: number;
  limit?: number;
  offset?: number;
}

/** Amendment to content */
export interface ContentAmendment {
  version: 2;
  type: "amendment";
  original: string; // CID of original
  author: string;
  timestamp: number;
  action: "hide" | "update" | "reaction";
  data?: Record<string, unknown>;
  signature: Uint8Array;
}
