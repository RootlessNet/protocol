/**
 * RootlessNet Identity Manager
 * Create, manage, and verify identities
 */

import {
  generateSigningKeyPair,
  generateEncryptionKeyPair,
  signingKeyPairFromSeed,
  encryptionKeyPairFromSeed,
  createDID,
  signHash,
  verifyHash,
  hkdf,
  encrypt,
  decrypt,
  generateNonce,
  getRandomBytes,
  zeroize,
  deriveKeyFromPassword,
  createArgon2Params,
  type KeySet,
} from "@rootlessnet/crypto";

import type {
  Identity,
  IdentityDocument,
  IdentityKey,
  CreateIdentityOptions,
  ExportedIdentity,
  IdentityVerification,
} from "./types.js";

/**
 * Canonical JSON serialization for signing
 */
function canonicalSerialize(obj: object): Uint8Array {
  const sorted = JSON.stringify(obj, Object.keys(obj).sort());
  return new TextEncoder().encode(sorted);
}

/**
 * Create a new identity
 */
export async function createIdentity(
  options: CreateIdentityOptions = {}
): Promise<Identity> {
  const { type = "persistent", seed } = options;

  let keySet: KeySet;

  if (seed) {
    // Derive keys from seed
    const signingMaterial = hkdf(seed, {
      info: "rootless-signing-key-v2",
      length: 32,
    });
    const encryptionMaterial = hkdf(seed, {
      info: "rootless-encryption-key-v2",
      length: 32,
    });

    keySet = {
      signing: signingKeyPairFromSeed(signingMaterial),
      encryption: encryptionKeyPairFromSeed(encryptionMaterial),
    };

    // Cleanup derived material
    zeroize(signingMaterial);
    zeroize(encryptionMaterial);
  } else {
    keySet = {
      signing: generateSigningKeyPair(),
      encryption: generateEncryptionKeyPair(),
    };
  }

  // Create DID from signing public key
  const did = createDID(keySet.signing.publicKey, "ed25519");

  const now = Date.now();

  // Create public keys array
  const publicKeys: IdentityKey[] = [
    {
      id: `${did}#key-1`,
      type: "Ed25519",
      purpose: "signing",
      publicKey: keySet.signing.publicKey,
      created: now,
    },
    {
      id: `${did}#key-2`,
      type: "X25519",
      purpose: "encryption",
      publicKey: keySet.encryption.publicKey,
      created: now,
    },
  ];

  // Create document without proof
  const documentWithoutProof = {
    version: 2 as const,
    did,
    type,
    publicKeys,
    created: now,
    updated: now,
  };

  // Sign the document
  const serialized = canonicalSerialize(documentWithoutProof);
  const signature = signHash(keySet.signing.privateKey, serialized);

  // Complete document with proof
  const document: IdentityDocument = {
    ...documentWithoutProof,
    proof: {
      type: "Ed25519Signature2020",
      created: now,
      verificationMethod: `${did}#key-1`,
      signature,
    },
  };

  return {
    did,
    type,
    document,
    keySet,
    created: now,
  };
}

/**
 * Verify an identity document
 */
export function verifyIdentityDocument(
  document: IdentityDocument
): IdentityVerification {
  const errors: string[] = [];

  // Check version
  if (document.version !== 2) {
    errors.push("INVALID_VERSION");
  }

  // Find signing key
  const signingKey = document.publicKeys.find(
    (k) => k.purpose === "signing" && k.id === document.proof.verificationMethod
  );

  if (!signingKey) {
    errors.push("SIGNING_KEY_NOT_FOUND");
    return { valid: false, errors };
  }

  // Verify DID matches signing public key
  const expectedDID = createDID(signingKey.publicKey, "ed25519");
  if (document.did !== expectedDID) {
    errors.push("DID_MISMATCH");
  }

  // Verify proof signature
  const documentWithoutProof = {
    version: document.version,
    did: document.did,
    type: document.type,
    publicKeys: document.publicKeys,
    created: document.created,
    updated: document.updated,
  };

  const serialized = canonicalSerialize(documentWithoutProof);
  const validSignature = verifyHash(
    signingKey.publicKey,
    serialized,
    document.proof.signature
  );

  if (!validSignature) {
    errors.push("INVALID_SIGNATURE");
  }

  // Check timestamps
  const now = Date.now();
  if (document.created > now + 300000) {
    // 5 min future tolerance
    errors.push("FUTURE_TIMESTAMP");
  }

  // Check for revoked keys
  for (const key of document.publicKeys) {
    if (key.revoked && key.revoked < now) {
      errors.push(`KEY_REVOKED:${key.id}`);
    }
    if (key.expires && key.expires < now) {
      errors.push(`KEY_EXPIRED:${key.id}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    document: errors.length === 0 ? document : undefined,
  };
}

/**
 * Export identity to encrypted backup
 */
export async function exportIdentity(
  identity: Identity,
  password: string
): Promise<ExportedIdentity> {
  // Serialize identity data
  const data = {
    did: identity.did,
    type: identity.type,
    document: {
      ...identity.document,
      publicKeys: identity.document.publicKeys.map((k) => ({
        ...k,
        publicKey: Array.from(k.publicKey),
      })),
      proof: {
        ...identity.document.proof,
        signature: Array.from(identity.document.proof.signature),
      },
    },
    keySet: {
      signing: {
        publicKey: Array.from(identity.keySet.signing.publicKey),
        privateKey: Array.from(identity.keySet.signing.privateKey),
      },
      encryption: {
        publicKey: Array.from(identity.keySet.encryption.publicKey),
        privateKey: Array.from(identity.keySet.encryption.privateKey),
      },
    },
    created: identity.created,
  };

  const plaintext = new TextEncoder().encode(JSON.stringify(data));

  // Derive encryption key from password
  const kdfParams = createArgon2Params();
  const encryptionKey = await deriveKeyFromPassword(password, kdfParams);

  // Encrypt
  const nonce = generateNonce();
  const { ciphertext } = encrypt(encryptionKey, plaintext, nonce);

  // Combine nonce + ciphertext
  const encrypted = new Uint8Array(nonce.length + ciphertext.length);
  encrypted.set(nonce);
  encrypted.set(ciphertext, nonce.length);

  // Cleanup
  zeroize(encryptionKey);

  return {
    version: 2,
    encrypted: true,
    data: encrypted,
    kdf: {
      algorithm: "argon2id",
      salt: kdfParams.salt,
      memoryCost: kdfParams.memoryCost,
      timeCost: kdfParams.timeCost,
      parallelism: kdfParams.parallelism,
    },
  };
}

/**
 * Import identity from encrypted backup
 */
export async function importIdentity(
  exported: ExportedIdentity,
  password: string
): Promise<Identity> {
  if (!exported.encrypted || !exported.kdf) {
    throw new Error("Unencrypted exports not supported");
  }

  // Derive decryption key
  const decryptionKey = await deriveKeyFromPassword(password, {
    ...exported.kdf,
    hashLength: 32,
  });

  // Extract nonce and ciphertext
  const nonce = exported.data.slice(0, 24);
  const ciphertext = exported.data.slice(24);

  // Decrypt
  let plaintext: Uint8Array;
  try {
    plaintext = decrypt(decryptionKey, ciphertext, nonce);
  } catch {
    zeroize(decryptionKey);
    throw new Error("Invalid password or corrupted data");
  }

  zeroize(decryptionKey);

  // Parse identity
  const data = JSON.parse(new TextDecoder().decode(plaintext));

  // Reconstruct identity
  const identity: Identity = {
    did: data.did,
    type: data.type,
    document: {
      ...data.document,
      publicKeys: data.document.publicKeys.map((k: any) => ({
        ...k,
        publicKey: new Uint8Array(k.publicKey),
      })),
      proof: {
        ...data.document.proof,
        signature: new Uint8Array(data.document.proof.signature),
      },
    },
    keySet: {
      signing: {
        publicKey: new Uint8Array(data.keySet.signing.publicKey),
        privateKey: new Uint8Array(data.keySet.signing.privateKey),
      },
      encryption: {
        publicKey: new Uint8Array(data.keySet.encryption.publicKey),
        privateKey: new Uint8Array(data.keySet.encryption.privateKey),
      },
    },
    created: data.created,
  };

  // Verify the imported identity
  const verification = verifyIdentityDocument(identity.document);
  if (!verification.valid) {
    throw new Error(`Invalid identity: ${verification.errors.join(", ")}`);
  }

  return identity;
}

/**
 * Get the signing public key from an identity
 */
export function getSigningKey(identity: Identity): Uint8Array {
  return identity.keySet.signing.publicKey;
}

/**
 * Get the encryption public key from an identity
 */
export function getEncryptionKey(identity: Identity): Uint8Array {
  return identity.keySet.encryption.publicKey;
}

/**
 * Sign data with an identity
 */
export function signWithIdentity(
  identity: Identity,
  data: Uint8Array
): Uint8Array {
  return signHash(identity.keySet.signing.privateKey, data);
}
