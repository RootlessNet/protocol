/**
 * RootlessNet X3DH Key Exchange
 * Extended Triple Diffie-Hellman for establishing secure sessions
 */

import {
  generateEncryptionKeyPair,
  generateSigningKeyPair,
  x25519ECDH,
  sign,
  verify,
  hkdf,
  zeroize,
  concat,
  getRandomBytes,
} from "@rootlessnet/crypto";

import type { PrekeyBundle, PrekeySet, X3DHResult } from "./types.js";

/**
 * Generate a complete prekey set
 */
export function generatePrekeySet(
  identityKeyPair: { publicKey: Uint8Array; privateKey: Uint8Array },
  signingKeyPair: { publicKey: Uint8Array; privateKey: Uint8Array },
  numOneTimePrekeys = 100
): PrekeySet {
  // Generate signed prekey
  const signedPrekeyPair = generateEncryptionKeyPair();
  const signedPrekeyId = randomId();
  const signedPrekeyCreated = Date.now();

  // Sign the prekey with the signing key
  const signature = sign(
    signingKeyPair.privateKey.slice(0, 32),
    signedPrekeyPair.publicKey
  );

  // Generate one-time prekeys
  const oneTimePrekeys = [];
  for (let i = 0; i < numOneTimePrekeys; i++) {
    const keyPair = generateEncryptionKeyPair();
    oneTimePrekeys.push({
      id: randomId(),
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      used: false,
    });
  }

  return {
    identityKey: identityKeyPair,
    signedPrekey: {
      id: signedPrekeyId,
      publicKey: signedPrekeyPair.publicKey,
      privateKey: signedPrekeyPair.privateKey,
      signature,
      created: signedPrekeyCreated,
    },
    oneTimePrekeys,
  };
}

/**
 * Get the public prekey bundle from a prekey set
 */
export function getPublicBundle(prekeySet: PrekeySet): PrekeyBundle {
  return {
    identityKey: prekeySet.identityKey.publicKey,
    signedPrekey: {
      id: prekeySet.signedPrekey.id,
      publicKey: prekeySet.signedPrekey.publicKey,
      signature: prekeySet.signedPrekey.signature,
      created: prekeySet.signedPrekey.created,
    },
    oneTimePrekeys: prekeySet.oneTimePrekeys
      .filter((k) => !k.used)
      .map((k) => ({
        id: k.id,
        publicKey: k.publicKey,
      })),
  };
}

/**
 * Perform X3DH as the initiator
 */
export function x3dhInitiate(
  ourIdentityKey: { publicKey: Uint8Array; privateKey: Uint8Array },
  theirBundle: PrekeyBundle,
  signingPublicKey: Uint8Array
): X3DHResult {
  // Verify the signed prekey
  if (
    !verify(
      signingPublicKey,
      theirBundle.signedPrekey.publicKey,
      theirBundle.signedPrekey.signature
    )
  ) {
    throw new Error("Invalid signed prekey signature");
  }

  // Generate ephemeral keypair
  const ephemeral = generateEncryptionKeyPair();

  // Calculate DH values
  // DH1 = DH(IK_A, SPK_B)
  const dh1 = x25519ECDH(
    ourIdentityKey.privateKey,
    theirBundle.signedPrekey.publicKey
  );

  // DH2 = DH(EK_A, IK_B)
  const dh2 = x25519ECDH(ephemeral.privateKey, theirBundle.identityKey);

  // DH3 = DH(EK_A, SPK_B)
  const dh3 = x25519ECDH(
    ephemeral.privateKey,
    theirBundle.signedPrekey.publicKey
  );

  // DH4 = DH(EK_A, OPK_B) if available
  let dh4: Uint8Array | undefined;
  let usedOneTimePrekeyId: number | undefined;

  if (theirBundle.oneTimePrekeys.length > 0) {
    const otp = theirBundle.oneTimePrekeys[0];
    dh4 = x25519ECDH(ephemeral.privateKey, otp.publicKey);
    usedOneTimePrekeyId = otp.id;
  }

  // Combine DH values
  const combined = dh4 ? concat(dh1, dh2, dh3, dh4) : concat(dh1, dh2, dh3);

  // Derive shared secret
  const sharedSecret = hkdf(combined, {
    info: "x3dh-v1",
    length: 32,
  });

  // Cleanup
  zeroize(dh1);
  zeroize(dh2);
  zeroize(dh3);
  if (dh4) zeroize(dh4);
  zeroize(combined);
  zeroize(ephemeral.privateKey);

  return {
    sharedSecret,
    ephemeralPublic: ephemeral.publicKey,
    usedSignedPrekeyId: theirBundle.signedPrekey.id,
    usedOneTimePrekeyId,
  };
}

/**
 * Complete X3DH as the responder
 */
export function x3dhRespond(
  ourPrekeySet: PrekeySet,
  theirIdentityKey: Uint8Array,
  theirEphemeralKey: Uint8Array,
  usedSignedPrekeyId: number,
  usedOneTimePrekeyId?: number
): Uint8Array {
  // Verify prekey IDs
  if (ourPrekeySet.signedPrekey.id !== usedSignedPrekeyId) {
    throw new Error("Unknown signed prekey ID");
  }

  // Calculate DH values
  // DH1 = DH(SPK_B, IK_A)
  const dh1 = x25519ECDH(
    ourPrekeySet.signedPrekey.privateKey,
    theirIdentityKey
  );

  // DH2 = DH(IK_B, EK_A)
  const dh2 = x25519ECDH(
    ourPrekeySet.identityKey.privateKey,
    theirEphemeralKey
  );

  // DH3 = DH(SPK_B, EK_A)
  const dh3 = x25519ECDH(
    ourPrekeySet.signedPrekey.privateKey,
    theirEphemeralKey
  );

  // DH4 if one-time prekey was used
  let dh4: Uint8Array | undefined;

  if (usedOneTimePrekeyId !== undefined) {
    const otp = ourPrekeySet.oneTimePrekeys.find(
      (k) => k.id === usedOneTimePrekeyId
    );
    if (!otp) {
      throw new Error("Unknown one-time prekey ID");
    }

    dh4 = x25519ECDH(otp.privateKey, theirEphemeralKey);
    otp.used = true;
  }

  // Combine DH values
  const combined = dh4 ? concat(dh1, dh2, dh3, dh4) : concat(dh1, dh2, dh3);

  // Derive shared secret
  const sharedSecret = hkdf(combined, {
    info: "x3dh-v1",
    length: 32,
  });

  // Cleanup
  zeroize(dh1);
  zeroize(dh2);
  zeroize(dh3);
  if (dh4) zeroize(dh4);
  zeroize(combined);

  return sharedSecret;
}

/**
 * Generate a random prekey ID
 */
function randomId(): number {
  const bytes = getRandomBytes(4);
  return new DataView(bytes.buffer).getUint32(0, true);
}

/**
 * Check if signed prekey needs rotation (older than 7 days)
 */
export function needsSignedPrekeyRotation(prekeySet: PrekeySet): boolean {
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - prekeySet.signedPrekey.created > sevenDays;
}

/**
 * Count available one-time prekeys
 */
export function countAvailablePrekeys(prekeySet: PrekeySet): number {
  return prekeySet.oneTimePrekeys.filter((k) => !k.used).length;
}
