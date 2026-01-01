/**
 * RootlessNet Crypto Tests
 */

import { describe, test, expect } from "bun:test";
import {
  // Random
  getRandomBytes,
  generateNonce,
  generateKey,

  // Hash
  hash,
  hashConcat,
  keyedHash,

  // Signing
  generateSigningKeyPair,
  sign,
  verify,
  signHash,
  verifyHash,

  // Encryption
  encrypt,
  decrypt,
  encryptCombined,
  decryptCombined,

  // Key Exchange
  generateEncryptionKeyPair,
  x25519ECDH,
  sealTo,
  unseal,
  encryptToMultiple,
  decryptMultiRecipient,

  // KDF
  hkdf,
  kdfChain,

  // Identifiers
  computeCID,
  createDID,
  parseDID,
  isValidDID,

  // Utils
  zeroize,
  constantTimeEqual,
  toHex,
  fromHex,
} from "../src/index.js";

describe("Random", () => {
  test("generates random bytes of correct length", () => {
    const bytes = getRandomBytes(32);
    expect(bytes.length).toBe(32);
  });

  test("generates unique values", () => {
    const a = getRandomBytes(32);
    const b = getRandomBytes(32);
    expect(constantTimeEqual(a, b)).toBe(false);
  });

  test("generateNonce returns 24 bytes", () => {
    expect(generateNonce().length).toBe(24);
  });

  test("generateKey returns 32 bytes", () => {
    expect(generateKey().length).toBe(32);
  });
});

describe("Hash", () => {
  test("hashes data consistently", () => {
    const data = new TextEncoder().encode("hello world");
    const hash1 = hash(data);
    const hash2 = hash(data);
    expect(constantTimeEqual(hash1, hash2)).toBe(true);
  });

  test("different data produces different hashes", () => {
    const hash1 = hash(new TextEncoder().encode("hello"));
    const hash2 = hash(new TextEncoder().encode("world"));
    expect(constantTimeEqual(hash1, hash2)).toBe(false);
  });

  test("hash is 32 bytes", () => {
    const h = hash(new TextEncoder().encode("test"));
    expect(h.length).toBe(32);
  });
});

describe("Signing", () => {
  test("generates valid keypair", () => {
    const keyPair = generateSigningKeyPair();
    expect(keyPair.publicKey.length).toBe(32);
    expect(keyPair.privateKey.length).toBe(64);
  });

  test("signs and verifies messages", () => {
    const keyPair = generateSigningKeyPair();
    const message = new TextEncoder().encode("test message");

    const signature = sign(keyPair.privateKey, message);
    expect(signature.length).toBe(64);

    const valid = verify(keyPair.publicKey, message, signature);
    expect(valid).toBe(true);
  });

  test("rejects invalid signatures", () => {
    const keyPair = generateSigningKeyPair();
    const message = new TextEncoder().encode("test message");
    const wrongMessage = new TextEncoder().encode("wrong message");

    const signature = sign(keyPair.privateKey, message);
    const valid = verify(keyPair.publicKey, wrongMessage, signature);
    expect(valid).toBe(false);
  });

  test("hash-then-sign works correctly", () => {
    const keyPair = generateSigningKeyPair();
    const data = new TextEncoder().encode("test data");

    const signature = signHash(keyPair.privateKey, data);
    const valid = verifyHash(keyPair.publicKey, data, signature);
    expect(valid).toBe(true);
  });
});

describe("Encryption", () => {
  test("encrypts and decrypts data", () => {
    const key = generateKey();
    const plaintext = new TextEncoder().encode("secret message");

    const { ciphertext, nonce } = encrypt(key, plaintext);
    expect(ciphertext.length).toBeGreaterThan(plaintext.length);

    const decrypted = decrypt(key, ciphertext, nonce);
    expect(new TextDecoder().decode(decrypted)).toBe("secret message");
  });

  test("decryption fails with wrong key", () => {
    const key1 = generateKey();
    const key2 = generateKey();
    const plaintext = new TextEncoder().encode("secret");

    const { ciphertext, nonce } = encrypt(key1, plaintext);

    expect(() => decrypt(key2, ciphertext, nonce)).toThrow();
  });

  test("combined encrypt/decrypt works", () => {
    const key = generateKey();
    const plaintext = new TextEncoder().encode("test");

    const combined = encryptCombined(key, plaintext);
    const decrypted = decryptCombined(key, combined);

    expect(new TextDecoder().decode(decrypted)).toBe("test");
  });
});

describe("Key Exchange", () => {
  test("ECDH produces shared secret", () => {
    const alice = generateEncryptionKeyPair();
    const bob = generateEncryptionKeyPair();

    const sharedA = x25519ECDH(alice.privateKey, bob.publicKey);
    const sharedB = x25519ECDH(bob.privateKey, alice.publicKey);

    expect(constantTimeEqual(sharedA, sharedB)).toBe(true);
  });

  test("sealed box encryption works", () => {
    const recipient = generateEncryptionKeyPair();
    const plaintext = new TextEncoder().encode("sealed secret");

    const sealed = sealTo(recipient.publicKey, plaintext);
    const unsealed = unseal(recipient.privateKey, sealed);

    expect(new TextDecoder().decode(unsealed)).toBe("sealed secret");
  });

  test("multi-recipient encryption works", () => {
    const recipient1 = generateEncryptionKeyPair();
    const recipient2 = generateEncryptionKeyPair();
    const plaintext = new TextEncoder().encode("for multiple");

    const encrypted = encryptToMultiple(
      [recipient1.publicKey, recipient2.publicKey],
      plaintext
    );

    // Both can decrypt
    const decrypted1 = decryptMultiRecipient(
      recipient1.privateKey,
      recipient1.publicKey,
      encrypted
    );
    const decrypted2 = decryptMultiRecipient(
      recipient2.privateKey,
      recipient2.publicKey,
      encrypted
    );

    expect(new TextDecoder().decode(decrypted1)).toBe("for multiple");
    expect(new TextDecoder().decode(decrypted2)).toBe("for multiple");
  });
});

describe("KDF", () => {
  test("HKDF produces consistent output", () => {
    const ikm = getRandomBytes(32);

    const key1 = hkdf(ikm, { info: "test", length: 32 });
    const key2 = hkdf(ikm, { info: "test", length: 32 });

    expect(constantTimeEqual(key1, key2)).toBe(true);
  });

  test("different info produces different keys", () => {
    const ikm = getRandomBytes(32);

    const key1 = hkdf(ikm, { info: "key1", length: 32 });
    const key2 = hkdf(ikm, { info: "key2", length: 32 });

    expect(constantTimeEqual(key1, key2)).toBe(false);
  });

  test("chain KDF works", () => {
    const chainKey = getRandomBytes(32);
    const { messageKey, nextChainKey } = kdfChain(chainKey);

    expect(messageKey.length).toBe(32);
    expect(nextChainKey.length).toBe(32);
    expect(constantTimeEqual(messageKey, nextChainKey)).toBe(false);
  });
});

describe("Identifiers", () => {
  test("CID is deterministic", () => {
    const data = new TextEncoder().encode("content");
    const cid1 = computeCID(data);
    const cid2 = computeCID(data);
    expect(cid1).toBe(cid2);
  });

  test("DID creation and parsing", () => {
    const keyPair = generateSigningKeyPair();
    const did = createDID(keyPair.publicKey);

    expect(did).toMatch(/^did:rootless:key:/);
    expect(isValidDID(did)).toBe(true);

    const parsed = parseDID(did);
    expect(parsed.method).toBe("key");
    expect(parsed.keyType).toBe("ed25519");
    expect(constantTimeEqual(parsed.publicKey, keyPair.publicKey)).toBe(true);
  });
});

describe("Utils", () => {
  test("zeroize clears buffer", () => {
    const buffer = new Uint8Array([1, 2, 3, 4, 5]);
    zeroize(buffer);
    expect(buffer.every((b) => b === 0)).toBe(true);
  });

  test("constant time compare works", () => {
    const a = new Uint8Array([1, 2, 3]);
    const b = new Uint8Array([1, 2, 3]);
    const c = new Uint8Array([1, 2, 4]);

    expect(constantTimeEqual(a, b)).toBe(true);
    expect(constantTimeEqual(a, c)).toBe(false);
  });

  test("hex encoding roundtrip", () => {
    const original = getRandomBytes(32);
    const hex = toHex(original);
    const decoded = fromHex(hex);
    expect(constantTimeEqual(original, decoded)).toBe(true);
  });
});
