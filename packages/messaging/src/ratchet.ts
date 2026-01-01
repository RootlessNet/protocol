/**
 * RootlessNet Double Ratchet Implementation
 * Provides forward secrecy and post-compromise security
 */

import {
  generateEncryptionKeyPair,
  x25519ECDH,
  encrypt,
  decrypt,
  kdfChain,
  kdfRootKey,
  generateNonce,
  zeroize,
  toHex,
} from "@rootlessnet/crypto";

import type { RatchetState, RatchetHeader, EncryptedMessage } from "./types.js";

/** Maximum number of skipped messages to store */
const MAX_SKIP = 1000;

/**
 * Initialize a ratchet state for the sender (who initiates)
 */
export function initSenderRatchet(
  sharedSecret: Uint8Array,
  recipientDhPublic: Uint8Array
): RatchetState {
  const dhSend = generateEncryptionKeyPair();

  // Perform initial DH
  const dhOutput = x25519ECDH(dhSend.privateKey, recipientDhPublic);
  const { newRootKey, chainKey } = kdfRootKey(sharedSecret, dhOutput);

  zeroize(dhOutput);

  return {
    dhSend,
    dhReceive: recipientDhPublic,
    rootKey: newRootKey,
    sendChainKey: chainKey,
    receiveChainKey: undefined,
    sendN: 0,
    receiveN: 0,
    previousSendN: 0,
    skippedKeys: new Map(),
    maxSkip: MAX_SKIP,
  };
}

/**
 * Initialize a ratchet state for the receiver
 */
export function initReceiverRatchet(
  sharedSecret: Uint8Array,
  dhKeyPair: { publicKey: Uint8Array; privateKey: Uint8Array }
): RatchetState {
  return {
    dhSend: dhKeyPair,
    dhReceive: undefined,
    rootKey: sharedSecret,
    sendChainKey: undefined,
    receiveChainKey: undefined,
    sendN: 0,
    receiveN: 0,
    previousSendN: 0,
    skippedKeys: new Map(),
    maxSkip: MAX_SKIP,
  };
}

/**
 * Perform a DH ratchet step
 */
function dhRatchetStep(state: RatchetState, theirDhPublic: Uint8Array): void {
  state.previousSendN = state.sendN;
  state.sendN = 0;
  state.receiveN = 0;
  state.dhReceive = theirDhPublic;

  // Derive receiving chain key
  const dhOutput1 = x25519ECDH(state.dhSend.privateKey, theirDhPublic);
  const result1 = kdfRootKey(state.rootKey, dhOutput1);
  state.rootKey = result1.newRootKey;
  state.receiveChainKey = result1.chainKey;

  // Generate new DH keypair
  const oldPrivate = state.dhSend.privateKey;
  state.dhSend = generateEncryptionKeyPair();
  zeroize(oldPrivate);

  // Derive sending chain key
  const dhOutput2 = x25519ECDH(state.dhSend.privateKey, theirDhPublic);
  const result2 = kdfRootKey(state.rootKey, dhOutput2);
  state.rootKey = result2.newRootKey;
  state.sendChainKey = result2.chainKey;

  // Cleanup
  zeroize(dhOutput1);
  zeroize(dhOutput2);
}

/**
 * Skip message keys for out-of-order delivery
 */
function skipMessageKeys(state: RatchetState, until: number): void {
  if (!state.receiveChainKey) return;

  if (state.receiveN + state.maxSkip < until) {
    throw new Error("Too many skipped messages");
  }

  while (state.receiveN < until) {
    const { messageKey, nextChainKey } = kdfChain(state.receiveChainKey);

    const keyId = `${toHex(state.dhReceive!)}:${state.receiveN}`;
    state.skippedKeys.set(keyId, messageKey);

    state.receiveChainKey = nextChainKey;
    state.receiveN++;

    // Limit stored keys
    if (state.skippedKeys.size > state.maxSkip) {
      // Remove oldest
      const firstKey = state.skippedKeys.keys().next().value;
      if (firstKey) {
        const oldKey = state.skippedKeys.get(firstKey);
        if (oldKey) zeroize(oldKey);
        state.skippedKeys.delete(firstKey);
      }
    }
  }
}

/**
 * Encrypt a message using the Double Ratchet
 */
export function ratchetEncrypt(
  state: RatchetState,
  plaintext: Uint8Array
): EncryptedMessage {
  if (!state.sendChainKey) {
    throw new Error("Ratchet not initialized for sending");
  }

  // Derive message key
  const { messageKey, nextChainKey } = kdfChain(state.sendChainKey);
  state.sendChainKey = nextChainKey;

  // Create header
  const header: RatchetHeader = {
    dhPublic: state.dhSend.publicKey,
    n: state.sendN,
    pn: state.previousSendN,
  };

  // Encrypt
  const nonce = generateNonce();
  const { ciphertext } = encrypt(messageKey, plaintext, nonce);

  // Increment counter
  state.sendN++;

  // Cleanup
  zeroize(messageKey);

  return {
    header,
    ciphertext,
    nonce,
  };
}

/**
 * Decrypt a message using the Double Ratchet
 */
export function ratchetDecrypt(
  state: RatchetState,
  message: EncryptedMessage
): Uint8Array {
  // Check for skipped message key
  const keyId = `${toHex(message.header.dhPublic)}:${message.header.n}`;
  const skippedKey = state.skippedKeys.get(keyId);

  if (skippedKey) {
    state.skippedKeys.delete(keyId);
    const plaintext = decrypt(skippedKey, message.ciphertext, message.nonce);
    zeroize(skippedKey);
    return plaintext;
  }

  // Check if DH ratchet step needed
  const dhChanged =
    !state.dhReceive ||
    !constantTimeEqual(message.header.dhPublic, state.dhReceive);

  if (dhChanged) {
    // Skip remaining messages in current receiving chain
    if (state.dhReceive) {
      skipMessageKeys(state, message.header.pn);
    }

    // Perform DH ratchet
    dhRatchetStep(state, message.header.dhPublic);
  }

  // Skip messages in new chain
  skipMessageKeys(state, message.header.n);

  // Derive message key
  if (!state.receiveChainKey) {
    throw new Error("No receiving chain key");
  }

  const { messageKey, nextChainKey } = kdfChain(state.receiveChainKey);
  state.receiveChainKey = nextChainKey;
  state.receiveN++;

  // Decrypt
  const plaintext = decrypt(messageKey, message.ciphertext, message.nonce);

  // Cleanup
  zeroize(messageKey);

  return plaintext;
}

/**
 * Constant-time comparison
 */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }

  return result === 0;
}

/**
 * Serialize ratchet state for storage
 */
export function serializeRatchetState(state: RatchetState): Uint8Array {
  const obj = {
    dhSend: {
      publicKey: Array.from(state.dhSend.publicKey),
      privateKey: Array.from(state.dhSend.privateKey),
    },
    dhReceive: state.dhReceive ? Array.from(state.dhReceive) : null,
    rootKey: Array.from(state.rootKey),
    sendChainKey: state.sendChainKey ? Array.from(state.sendChainKey) : null,
    receiveChainKey: state.receiveChainKey
      ? Array.from(state.receiveChainKey)
      : null,
    sendN: state.sendN,
    receiveN: state.receiveN,
    previousSendN: state.previousSendN,
    skippedKeys: Array.from(state.skippedKeys.entries()).map(([k, v]) => [
      k,
      Array.from(v),
    ]),
    maxSkip: state.maxSkip,
  };

  return new TextEncoder().encode(JSON.stringify(obj));
}

/**
 * Deserialize ratchet state from storage
 */
export function deserializeRatchetState(data: Uint8Array): RatchetState {
  const obj = JSON.parse(new TextDecoder().decode(data));

  return {
    dhSend: {
      publicKey: new Uint8Array(obj.dhSend.publicKey),
      privateKey: new Uint8Array(obj.dhSend.privateKey),
    },
    dhReceive: obj.dhReceive ? new Uint8Array(obj.dhReceive) : undefined,
    rootKey: new Uint8Array(obj.rootKey),
    sendChainKey: obj.sendChainKey
      ? new Uint8Array(obj.sendChainKey)
      : undefined,
    receiveChainKey: obj.receiveChainKey
      ? new Uint8Array(obj.receiveChainKey)
      : undefined,
    sendN: obj.sendN,
    receiveN: obj.receiveN,
    previousSendN: obj.previousSendN,
    skippedKeys: new Map(
      obj.skippedKeys.map(([k, v]: [string, number[]]) => [
        k,
        new Uint8Array(v),
      ])
    ),
    maxSkip: obj.maxSkip,
  };
}
