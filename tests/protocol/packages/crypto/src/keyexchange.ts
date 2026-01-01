/**
 * RootlessNet Key Exchange
 * X25519 ECDH for key agreement
 */

import { x25519 } from "@noble/curves/ed25519";
import type {
  EncryptionKeyPair,
  SealedBox,
  MultiRecipientPayload,
  RecipientKey,
} from "./types.js";
import { getRandomBytes, generateNonce } from "./random.js";
import { encrypt, decrypt, KEY_SIZE } from "./encryption.js";
import { hkdf } from "./kdf.js";

/**
 * Generate a new X25519 encryption keypair
 */
export function generateEncryptionKeyPair(): EncryptionKeyPair {
  const privateKey = x25519.utils.randomPrivateKey();
  const publicKey = x25519.getPublicKey(privateKey);

  return { publicKey, privateKey };
}

/**
 * Derive encryption keypair from a 32-byte seed
 */
export function encryptionKeyPairFromSeed(seed: Uint8Array): EncryptionKeyPair {
  if (seed.length !== 32) {
    throw new Error("Seed must be 32 bytes");
  }

  const publicKey = x25519.getPublicKey(seed);
  return { publicKey, privateKey: seed };
}

/**
 * Perform X25519 Diffie-Hellman key exchange
 * @param myPrivateKey - Our private key
 * @param theirPublicKey - Their public key
 * @returns Shared secret (32 bytes)
 */
export function x25519ECDH(
  myPrivateKey: Uint8Array,
  theirPublicKey: Uint8Array
): Uint8Array {
  return x25519.getSharedSecret(myPrivateKey, theirPublicKey);
}

/**
 * Encrypt to a recipient using ephemeral-static ECDH
 * Creates a sealed box that only the recipient can open
 */
export function sealTo(
  recipientPublicKey: Uint8Array,
  plaintext: Uint8Array
): SealedBox {
  // Generate ephemeral keypair
  const ephemeral = generateEncryptionKeyPair();

  // Compute shared secret
  const sharedSecret = x25519ECDH(ephemeral.privateKey, recipientPublicKey);

  // Derive encryption key
  const encryptionKey = hkdf(sharedSecret, {
    info: "rootless-sealed-box-v2",
    length: KEY_SIZE,
  });

  // Encrypt
  const nonce = generateNonce();
  const { ciphertext } = encrypt(encryptionKey, plaintext, nonce);

  // Zeroize sensitive data
  sharedSecret.fill(0);
  encryptionKey.fill(0);
  ephemeral.privateKey.fill(0);

  return {
    ephemeralPublic: ephemeral.publicKey,
    ciphertext,
    nonce,
  };
}

/**
 * Open a sealed box using our private key
 */
export function unseal(
  myPrivateKey: Uint8Array,
  sealed: SealedBox
): Uint8Array {
  // Compute shared secret
  const sharedSecret = x25519ECDH(myPrivateKey, sealed.ephemeralPublic);

  // Derive decryption key
  const decryptionKey = hkdf(sharedSecret, {
    info: "rootless-sealed-box-v2",
    length: KEY_SIZE,
  });

  // Decrypt
  const plaintext = decrypt(decryptionKey, sealed.ciphertext, sealed.nonce);

  // Zeroize sensitive data
  sharedSecret.fill(0);
  decryptionKey.fill(0);

  return plaintext;
}

/**
 * Encrypt to multiple recipients
 * Each recipient gets the content key encrypted to their public key
 */
export function encryptToMultiple(
  recipientPublicKeys: Uint8Array[],
  plaintext: Uint8Array
): MultiRecipientPayload {
  if (recipientPublicKeys.length === 0) {
    throw new Error("At least one recipient required");
  }

  // Generate ephemeral keypair and content key
  const ephemeral = generateEncryptionKeyPair();
  const contentKey = getRandomBytes(KEY_SIZE);

  // Encrypt content key to each recipient
  const recipients: RecipientKey[] = recipientPublicKeys.map((recipientPK) => {
    const sharedSecret = x25519ECDH(ephemeral.privateKey, recipientPK);
    const wrapKey = hkdf(sharedSecret, {
      info: "rootless-multi-recipient-wrap-v2",
      length: KEY_SIZE,
    });

    const nonce = generateNonce();
    const { ciphertext } = encrypt(wrapKey, contentKey, nonce);

    // Cleanup
    sharedSecret.fill(0);
    wrapKey.fill(0);

    return {
      recipientPublicKey: recipientPK,
      encryptedKey: ciphertext,
      nonce,
    };
  });

  // Encrypt content with content key
  const contentNonce = generateNonce();
  const { ciphertext } = encrypt(contentKey, plaintext, contentNonce);

  // Cleanup
  ephemeral.privateKey.fill(0);
  contentKey.fill(0);

  return {
    ephemeralPublic: ephemeral.publicKey,
    recipients,
    ciphertext,
    nonce: contentNonce,
  };
}

/**
 * Decrypt multi-recipient payload
 */
export function decryptMultiRecipient(
  myPrivateKey: Uint8Array,
  myPublicKey: Uint8Array,
  payload: MultiRecipientPayload
): Uint8Array {
  // Find our recipient entry
  const myEntry = payload.recipients.find((r) =>
    constantTimeEqual(r.recipientPublicKey, myPublicKey)
  );

  if (!myEntry) {
    throw new Error("Not a recipient of this message");
  }

  // Derive unwrap key
  const sharedSecret = x25519ECDH(myPrivateKey, payload.ephemeralPublic);
  const unwrapKey = hkdf(sharedSecret, {
    info: "rootless-multi-recipient-wrap-v2",
    length: KEY_SIZE,
  });

  // Decrypt content key
  const contentKey = decrypt(unwrapKey, myEntry.encryptedKey, myEntry.nonce);

  // Decrypt content
  const plaintext = decrypt(contentKey, payload.ciphertext, payload.nonce);

  // Cleanup
  sharedSecret.fill(0);
  unwrapKey.fill(0);
  contentKey.fill(0);

  return plaintext;
}

/**
 * Constant-time comparison of byte arrays
 */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }

  return result === 0;
}

export { x25519 };
