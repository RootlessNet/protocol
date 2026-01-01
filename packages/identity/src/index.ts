/**
 * RootlessNet Identity Package
 * Identity management for the protocol
 */

// Types
export * from "./types.js";

// Identity management
export {
  createIdentity,
  verifyIdentityDocument,
  exportIdentity,
  importIdentity,
  getSigningKey,
  getEncryptionKey,
  signWithIdentity,
} from "./identity.js";

// Re-export DID utilities from crypto
export { createDID, parseDID, isValidDID, shortDID } from "@rootlessnet/crypto";
