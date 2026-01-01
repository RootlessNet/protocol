/**
 * RootlessNet Messaging Types
 */

/** Message type */
export type MessageType =
  | "direct"
  | "group"
  | "broadcast"
  | "ephemeral"
  | "sealed";

/** Message header for Double Ratchet */
export interface RatchetHeader {
  dhPublic: Uint8Array;
  n: number; // Message number in sending chain
  pn: number; // Previous chain length
}

/** Double ratchet state */
export interface RatchetState {
  // DH ratchet
  dhSend: {
    publicKey: Uint8Array;
    privateKey: Uint8Array;
  };
  dhReceive?: Uint8Array;

  // Root and chain keys
  rootKey: Uint8Array;
  sendChainKey?: Uint8Array;
  receiveChainKey?: Uint8Array;

  // Counters
  sendN: number;
  receiveN: number;
  previousSendN: number;

  // Skipped message keys for out-of-order delivery
  skippedKeys: Map<string, Uint8Array>;
  maxSkip: number;
}

/** Prekey bundle for X3DH */
export interface PrekeyBundle {
  identityKey: Uint8Array;
  signedPrekey: {
    id: number;
    publicKey: Uint8Array;
    signature: Uint8Array;
    created: number;
  };
  oneTimePrekeys: {
    id: number;
    publicKey: Uint8Array;
  }[];
}

/** Complete prekey set with private keys */
export interface PrekeySet {
  identityKey: {
    publicKey: Uint8Array;
    privateKey: Uint8Array;
  };
  signedPrekey: {
    id: number;
    publicKey: Uint8Array;
    privateKey: Uint8Array;
    signature: Uint8Array;
    created: number;
  };
  oneTimePrekeys: {
    id: number;
    publicKey: Uint8Array;
    privateKey: Uint8Array;
    used: boolean;
  }[];
}

/** X3DH result */
export interface X3DHResult {
  sharedSecret: Uint8Array;
  ephemeralPublic: Uint8Array;
  usedSignedPrekeyId: number;
  usedOneTimePrekeyId?: number;
}

/** Encrypted message */
export interface EncryptedMessage {
  header: RatchetHeader;
  ciphertext: Uint8Array;
  nonce: Uint8Array;
}

/** Direct message */
export interface DirectMessage {
  version: 2;
  id: string;
  conversationId: string;
  sender: string;
  type: MessageType;
  encrypted: EncryptedMessage;
  timestamp: number;
  replyTo?: string;
  expiresAt?: number;
}

/** Sealed message (anonymous sender) */
export interface SealedMessage {
  version: 2;
  type: "sealed";
  ephemeralPublic: Uint8Array;
  ciphertext: Uint8Array;
  nonce: Uint8Array;
}

/** Conversation */
export interface Conversation {
  id: string;
  participants: string[];
  ratchetState: RatchetState;
  created: number;
  lastMessage?: number;
}

/** Message delivery status */
export type DeliveryStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

/** Message with status */
export interface MessageWithStatus {
  message: DirectMessage;
  status: DeliveryStatus;
  attempts: number;
  lastAttempt?: number;
}
