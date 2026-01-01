/**
 * RootlessNet Messaging Package
 * End-to-end encrypted messaging with forward secrecy
 */

// Types
export * from "./types.js";

// Double Ratchet
export {
  initSenderRatchet,
  initReceiverRatchet,
  ratchetEncrypt,
  ratchetDecrypt,
  serializeRatchetState,
  deserializeRatchetState,
} from "./ratchet.js";

// X3DH Key Exchange
export {
  generatePrekeySet,
  getPublicBundle,
  x3dhInitiate,
  x3dhRespond,
  needsSignedPrekeyRotation,
  countAvailablePrekeys,
} from "./x3dh.js";

// Session Manager
export { SessionManager } from "./session.js";
