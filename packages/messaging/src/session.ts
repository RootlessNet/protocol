/**
 * RootlessNet Session Manager
 * Manages messaging sessions with Double Ratchet
 */

import {
  generateUUID,
  sealTo,
  unseal,
  generateNonce,
  encrypt as symmetricEncrypt,
  decrypt as symmetricDecrypt,
} from "@rootlessnet/crypto";

import type { Identity } from "@rootlessnet/identity";

import type {
  DirectMessage,
  SealedMessage,
  Conversation,
  RatchetState,
  EncryptedMessage,
  PrekeyBundle,
  PrekeySet,
} from "./types.js";

import {
  initSenderRatchet,
  initReceiverRatchet,
  ratchetEncrypt,
  ratchetDecrypt,
  serializeRatchetState,
  deserializeRatchetState,
} from "./ratchet.js";

import {
  x3dhInitiate,
  x3dhRespond,
  generatePrekeySet,
  getPublicBundle,
} from "./x3dh.js";

/**
 * Session manager for secure messaging
 */
export class SessionManager {
  private identity: Identity;
  private prekeySet: PrekeySet;
  private conversations: Map<string, Conversation> = new Map();

  constructor(identity: Identity) {
    this.identity = identity;

    // Generate initial prekey set
    this.prekeySet = generatePrekeySet(
      identity.keySet.encryption,
      identity.keySet.signing
    );
  }

  /**
   * Get our public prekey bundle
   */
  getPublicBundle(): PrekeyBundle {
    return getPublicBundle(this.prekeySet);
  }

  /**
   * Initiate a conversation with a peer
   */
  async initiateConversation(
    recipientDid: string,
    recipientBundle: PrekeyBundle,
    recipientSigningKey: Uint8Array
  ): Promise<Conversation> {
    // Perform X3DH
    const x3dhResult = x3dhInitiate(
      this.identity.keySet.encryption,
      recipientBundle,
      recipientSigningKey
    );

    // Initialize sender ratchet
    const ratchetState = initSenderRatchet(
      x3dhResult.sharedSecret,
      recipientBundle.signedPrekey.publicKey
    );

    const conversation: Conversation = {
      id: generateUUID(),
      participants: [this.identity.did, recipientDid],
      ratchetState,
      created: Date.now(),
    };

    this.conversations.set(conversation.id, conversation);

    return conversation;
  }

  /**
   * Accept a conversation initiated by a peer
   */
  async acceptConversation(
    initiatorDid: string,
    initiatorIdentityKey: Uint8Array,
    initiatorEphemeralKey: Uint8Array,
    usedSignedPrekeyId: number,
    usedOneTimePrekeyId?: number
  ): Promise<Conversation> {
    // Complete X3DH
    const sharedSecret = x3dhRespond(
      this.prekeySet,
      initiatorIdentityKey,
      initiatorEphemeralKey,
      usedSignedPrekeyId,
      usedOneTimePrekeyId
    );

    // Initialize receiver ratchet
    const ratchetState = initReceiverRatchet(sharedSecret, {
      publicKey: this.prekeySet.signedPrekey.publicKey,
      privateKey: this.prekeySet.signedPrekey.privateKey,
    });

    const conversation: Conversation = {
      id: generateUUID(),
      participants: [initiatorDid, this.identity.did],
      ratchetState,
      created: Date.now(),
    };

    this.conversations.set(conversation.id, conversation);

    return conversation;
  }

  /**
   * Send a message in a conversation
   */
  sendMessage(
    conversationId: string,
    plaintext: string | Uint8Array,
    options: {
      replyTo?: string;
      expiresAt?: number;
    } = {}
  ): DirectMessage {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Convert plaintext to bytes
    const plaintextBytes =
      typeof plaintext === "string"
        ? new TextEncoder().encode(plaintext)
        : plaintext;

    // Encrypt with ratchet
    const encrypted = ratchetEncrypt(conversation.ratchetState, plaintextBytes);

    const message: DirectMessage = {
      version: 2,
      id: generateUUID(),
      conversationId,
      sender: this.identity.did,
      type: "direct",
      encrypted,
      timestamp: Date.now(),
      replyTo: options.replyTo,
      expiresAt: options.expiresAt,
    };

    conversation.lastMessage = message.timestamp;

    return message;
  }

  /**
   * Receive and decrypt a message
   */
  receiveMessage(message: DirectMessage): Uint8Array {
    const conversation = this.conversations.get(message.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Check expiration
    if (message.expiresAt && message.expiresAt < Date.now()) {
      throw new Error("Message expired");
    }

    // Decrypt with ratchet
    const plaintext = ratchetDecrypt(
      conversation.ratchetState,
      message.encrypted
    );

    conversation.lastMessage = message.timestamp;

    return plaintext;
  }

  /**
   * Send a sealed (anonymous) message
   */
  sendSealedMessage(
    recipientEncryptionKey: Uint8Array,
    plaintext: string | Uint8Array
  ): SealedMessage {
    const plaintextBytes =
      typeof plaintext === "string"
        ? new TextEncoder().encode(plaintext)
        : plaintext;

    const sealed = sealTo(recipientEncryptionKey, plaintextBytes);

    return {
      version: 2,
      type: "sealed",
      ephemeralPublic: sealed.ephemeralPublic,
      ciphertext: sealed.ciphertext,
      nonce: sealed.nonce,
    };
  }

  /**
   * Receive a sealed message
   */
  receiveSealedMessage(message: SealedMessage): Uint8Array {
    return unseal(this.identity.keySet.encryption.privateKey, {
      ephemeralPublic: message.ephemeralPublic,
      ciphertext: message.ciphertext,
      nonce: message.nonce,
    });
  }

  /**
   * Get a conversation by ID
   */
  getConversation(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  /**
   * List all conversations
   */
  listConversations(): Conversation[] {
    return Array.from(this.conversations.values());
  }

  /**
   * Export session state for storage
   */
  exportState(): Uint8Array {
    const state = {
      conversations: Array.from(this.conversations.entries()).map(
        ([id, conv]) => ({
          id,
          participants: conv.participants,
          ratchetState: Array.from(serializeRatchetState(conv.ratchetState)),
          created: conv.created,
          lastMessage: conv.lastMessage,
        })
      ),
    };

    return new TextEncoder().encode(JSON.stringify(state));
  }

  /**
   * Import session state from storage
   */
  importState(data: Uint8Array): void {
    const state = JSON.parse(new TextDecoder().decode(data));

    this.conversations.clear();

    for (const conv of state.conversations) {
      this.conversations.set(conv.id, {
        id: conv.id,
        participants: conv.participants,
        ratchetState: deserializeRatchetState(
          new Uint8Array(conv.ratchetState)
        ),
        created: conv.created,
        lastMessage: conv.lastMessage,
      });
    }
  }
}
