/**
 * RootlessNet Content Identifiers
 * CID (Content Identifier) and DID (Decentralized Identifier) handling
 */

import { base58btc } from "multiformats/bases/base58";
import { base32 } from "multiformats/bases/base32";
import { hash } from "./hash.js";

/** Multicodec codes */
export const MULTICODEC = {
  RAW: 0x55,
  DAG_CBOR: 0x71,
  ED25519_PUB: 0xed,
  X25519_PUB: 0xec,
  BLAKE3: 0x1e,
} as const;

/**
 * Compute a Content Identifier (CID) for data
 * Uses CIDv1 with BLAKE3 hash
 */
export function computeCID(data: Uint8Array): string {
  // Hash the data
  const hashBytes = hash(data);

  // Create multihash: varint(codec) + varint(length) + hash
  const multihash = new Uint8Array(2 + hashBytes.length);
  multihash[0] = MULTICODEC.BLAKE3;
  multihash[1] = hashBytes.length;
  multihash.set(hashBytes, 2);

  // Create CID: version + codec + multihash
  const cid = new Uint8Array(2 + multihash.length);
  cid[0] = 0x01; // CIDv1
  cid[1] = MULTICODEC.RAW;
  cid.set(multihash, 2);

  // Encode as base32 (lowercase, 'b' prefix)
  return base32.encode(cid);
}

/**
 * Parse a CID string and extract the hash
 */
export function parseCID(cidStr: string): {
  version: number;
  codec: number;
  hashFunction: number;
  hash: Uint8Array;
} {
  const bytes = base32.decode(cidStr);

  const version = bytes[0];
  const codec = bytes[1];
  const hashFunction = bytes[2];
  const hashLength = bytes[3];
  const hashBytes = bytes.slice(4, 4 + hashLength);

  return {
    version,
    codec,
    hashFunction,
    hash: hashBytes,
  };
}

/**
 * Verify that a CID matches the given data
 */
export function verifyCID(cidStr: string, data: Uint8Array): boolean {
  const expectedCID = computeCID(data);
  return cidStr === expectedCID;
}

/**
 * Create a Decentralized Identifier (DID) from a public key
 * Format: did:rootless:key:<multibase-encoded-multicodec-public-key>
 */
export function createDID(
  publicKey: Uint8Array,
  keyType: "ed25519" | "x25519" = "ed25519"
): string {
  const codec =
    keyType === "ed25519" ? MULTICODEC.ED25519_PUB : MULTICODEC.X25519_PUB;

  // Create multicodec: codec + key
  const multicodec = new Uint8Array(2 + publicKey.length);
  multicodec[0] = codec;
  multicodec[1] = 0x01; // Length prefix for simple codecs
  multicodec.set(publicKey, 2);

  // Encode as base58btc
  const encoded = base58btc.encode(multicodec);

  return `did:rootless:key:${encoded}`;
}

/**
 * Parse a DID and extract the public key
 */
export function parseDID(did: string): {
  method: string;
  keyType: "ed25519" | "x25519";
  publicKey: Uint8Array;
} {
  const parts = did.split(":");

  if (parts.length !== 4 || parts[0] !== "did" || parts[1] !== "rootless") {
    throw new Error("Invalid DID format");
  }

  const method = parts[2];
  const identifier = parts[3];

  if (method !== "key") {
    throw new Error(`Unsupported DID method: ${method}`);
  }

  // Decode base58btc
  const multicodec = base58btc.decode(identifier);

  const codec = multicodec[0];
  const publicKey = multicodec.slice(2);

  let keyType: "ed25519" | "x25519";
  if (codec === MULTICODEC.ED25519_PUB) {
    keyType = "ed25519";
  } else if (codec === MULTICODEC.X25519_PUB) {
    keyType = "x25519";
  } else {
    throw new Error(`Unsupported key codec: ${codec}`);
  }

  return { method, keyType, publicKey };
}

/**
 * Validate that a string is a valid DID
 */
export function isValidDID(did: string): boolean {
  try {
    parseDID(did);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate that a string is a valid CID
 */
export function isValidCID(cid: string): boolean {
  try {
    parseCID(cid);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create a short identifier from a DID (last 8 chars)
 */
export function shortDID(did: string): string {
  const parts = did.split(":");
  const identifier = parts[parts.length - 1];
  return identifier.slice(-8);
}

/**
 * Create a short identifier from a CID (last 8 chars)
 */
export function shortCID(cid: string): string {
  return cid.slice(-8);
}
