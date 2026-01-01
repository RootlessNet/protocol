/**
 * RootlessNet Content Manager
 * Create, sign, verify, and manage content
 */

import {
  hash,
  computeCID,
  verifyCID,
  signHash,
  verifyHash,
  parseDID,
  encryptToMultiple,
  decryptMultiRecipient,
  sealTo,
  unseal,
} from "@rootlessnet/crypto";

import type { Identity } from "@rootlessnet/identity";

import type {
  ContentObject,
  CreateContentInput,
  ContentVerification,
  ContentPayload,
  ClearPayload,
  EncryptedPayload,
  EncryptionLevel,
} from "./types.js";

/**
 * Canonical JSON serialization for signing
 */
function canonicalSerialize(obj: object): Uint8Array {
  const replacer = (_key: string, value: unknown) => {
    if (value instanceof Uint8Array) {
      return Array.from(value);
    }
    return value;
  };

  const sortKeys = (o: unknown): unknown => {
    if (Array.isArray(o)) {
      return o.map(sortKeys);
    }
    if (o !== null && typeof o === "object") {
      return Object.keys(o as object)
        .sort()
        .reduce((sorted, key) => {
          (sorted as Record<string, unknown>)[key] = sortKeys(
            (o as Record<string, unknown>)[key]
          );
          return sorted;
        }, {});
    }
    return o;
  };

  const sorted = sortKeys(obj);
  const json = JSON.stringify(sorted, replacer);
  return new TextEncoder().encode(json);
}

/**
 * Create a new content object
 */
export async function createContent(
  input: CreateContentInput,
  identity: Identity
): Promise<ContentObject> {
  const {
    payload: inputPayload,
    contentType = "text/plain",
    zone = "public",
    parent,
    thread,
    mentions = [],
    tags = [],
    language,
    encryption = "none",
    recipients = [],
    expiresAt,
    extensions,
  } = input;

  // Convert string payload to bytes
  const payloadBytes =
    typeof inputPayload === "string"
      ? new TextEncoder().encode(inputPayload)
      : inputPayload;

  // Hash the original payload
  const payloadHash = hash(payloadBytes);

  // Create payload based on encryption level
  let payload: ContentPayload;

  switch (encryption) {
    case "none":
      payload = {
        type: "clear",
        data: payloadBytes,
      } as ClearPayload;
      break;

    case "recipients":
      if (recipients.length === 0) {
        throw new Error("Recipients required for recipient encryption");
      }

      // Get recipient public keys
      const recipientKeys = await Promise.all(
        recipients.map(async (did) => {
          const parsed = parseDID(did);
          return parsed.publicKey;
        })
      );

      const encrypted = encryptToMultiple(recipientKeys, payloadBytes);

      payload = {
        type: "encrypted",
        algorithm: "xchacha20-poly1305",
        ephemeralPublic: encrypted.ephemeralPublic,
        recipients: encrypted.recipients.map((r, i) => ({
          did: recipients[i],
          encryptedKey: r.encryptedKey,
          nonce: r.nonce,
        })),
        ciphertext: encrypted.ciphertext,
        nonce: encrypted.nonce,
      } as EncryptedPayload;
      break;

    case "self":
      // Encrypt to self using own encryption key
      const sealed = sealTo(identity.keySet.encryption.publicKey, payloadBytes);

      payload = {
        type: "encrypted",
        algorithm: "xchacha20-poly1305",
        ephemeralPublic: sealed.ephemeralPublic,
        ciphertext: sealed.ciphertext,
        nonce: sealed.nonce,
      } as EncryptedPayload;
      break;

    case "zone":
      // Zone encryption requires zone key (not implemented here)
      throw new Error("Zone encryption requires zone key management");

    default:
      throw new Error(`Unknown encryption level: ${encryption}`);
  }

  // Build content object without id and signature
  const contentWithoutIdAndSig = {
    version: 2 as const,
    author: identity.did,
    timestamp: Date.now(),
    expiresAt,
    zone,
    parent,
    thread: thread ?? parent,
    mentions,
    contentType,
    payloadEncryption: encryption,
    payload,
    payloadHash,
    tags,
    language,
    extensions,
  };

  // Serialize for signing
  const serialized = canonicalSerialize(contentWithoutIdAndSig);

  // Sign
  const signature = signHash(identity.keySet.signing.privateKey, serialized);

  // Add signature
  const contentWithSig = {
    ...contentWithoutIdAndSig,
    signature,
  };

  // Compute CID
  const id = computeCID(canonicalSerialize(contentWithSig));

  return {
    id,
    ...contentWithSig,
  } as ContentObject;
}

/**
 * Verify a content object
 */
export async function verifyContent(
  content: ContentObject,
  resolvePublicKey?: (did: string) => Promise<Uint8Array>
): Promise<ContentVerification> {
  const errors: string[] = [];

  // Check version
  if (content.version !== 2) {
    errors.push("INVALID_VERSION");
  }

  // Verify CID
  const contentWithoutId = { ...content };
  delete (contentWithoutId as any).id;

  const expectedCID = computeCID(canonicalSerialize(contentWithoutId));
  if (content.id !== expectedCID) {
    errors.push("INVALID_CID");
  }

  // Get author's public key
  let authorPublicKey: Uint8Array;

  if (resolvePublicKey) {
    try {
      authorPublicKey = await resolvePublicKey(content.author);
    } catch {
      errors.push("AUTHOR_KEY_NOT_FOUND");
      return { valid: false, errors };
    }
  } else {
    // Try to extract from DID
    try {
      const parsed = parseDID(content.author);
      authorPublicKey = parsed.publicKey;
    } catch {
      errors.push("INVALID_AUTHOR_DID");
      return { valid: false, errors };
    }
  }

  // Verify signature
  const contentForSigning = { ...content };
  delete (contentForSigning as any).id;
  delete (contentForSigning as any).signature;

  const serialized = canonicalSerialize(contentForSigning);
  const validSig = verifyHash(authorPublicKey, serialized, content.signature);

  if (!validSig) {
    errors.push("INVALID_SIGNATURE");
  }

  // Verify timestamp
  const now = Date.now();
  const maxFuture = 5 * 60 * 1000; // 5 minutes

  if (content.timestamp > now + maxFuture) {
    errors.push("FUTURE_TIMESTAMP");
  }

  // Check expiration
  if (content.expiresAt && content.expiresAt < now) {
    errors.push("EXPIRED");
  }

  // Verify payload hash for clear payloads
  if (content.payload.type === "clear") {
    const computedHash = hash(content.payload.data);
    const hashMatch = computedHash.every(
      (b, i) => b === content.payloadHash[i]
    );

    if (!hashMatch) {
      errors.push("INVALID_PAYLOAD_HASH");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    content: errors.length === 0 ? content : undefined,
  };
}

/**
 * Decrypt content payload
 */
export function decryptPayload(
  content: ContentObject,
  identity: Identity
): Uint8Array {
  if (content.payload.type === "clear") {
    return content.payload.data;
  }

  if (content.payload.type === "encrypted") {
    const payload = content.payload as EncryptedPayload;

    // Check if we're a recipient
    if (payload.recipients) {
      // Multi-recipient encryption
      const multiPayload = {
        ephemeralPublic: payload.ephemeralPublic!,
        recipients: payload.recipients.map((r) => ({
          recipientPublicKey: parseDID(r.did).publicKey,
          encryptedKey: r.encryptedKey,
          nonce: r.nonce,
        })),
        ciphertext: payload.ciphertext,
        nonce: payload.nonce,
      };

      return decryptMultiRecipient(
        identity.keySet.encryption.privateKey,
        identity.keySet.encryption.publicKey,
        multiPayload
      );
    }

    // Self-encrypted (sealed box)
    return unseal(identity.keySet.encryption.privateKey, {
      ephemeralPublic: payload.ephemeralPublic!,
      ciphertext: payload.ciphertext,
      nonce: payload.nonce,
    });
  }

  throw new Error("Cannot decrypt zone-encrypted content without zone key");
}

/**
 * Get payload as text
 */
export function getPayloadText(
  content: ContentObject,
  identity?: Identity
): string {
  let data: Uint8Array;

  if (content.payload.type === "clear") {
    data = content.payload.data;
  } else if (identity) {
    data = decryptPayload(content, identity);
  } else {
    throw new Error("Identity required to decrypt payload");
  }

  return new TextDecoder().decode(data);
}

/**
 * Check if content is a reply
 */
export function isReply(content: ContentObject): boolean {
  return !!content.parent;
}

/**
 * Check if content is encrypted
 */
export function isEncrypted(content: ContentObject): boolean {
  return content.payload.type !== "clear";
}
