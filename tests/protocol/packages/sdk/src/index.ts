/**
 * RootlessNet SDK
 * Complete SDK for building applications on RootlessNet
 */

import {
  createIdentity,
  exportIdentity,
  importIdentity,
  verifyIdentityDocument,
  type Identity,
  type CreateIdentityOptions,
  type ExportedIdentity,
} from "@rootlessnet/identity";

import {
  createContent,
  verifyContent,
  decryptPayload,
  getPayloadText,
  type ContentObject,
  type CreateContentInput,
} from "@rootlessnet/content";

import {
  SessionManager,
  type DirectMessage,
  type SealedMessage,
  type Conversation,
  type PrekeyBundle,
} from "@rootlessnet/messaging";

import { parseDID, createDID, computeCID } from "@rootlessnet/crypto";

/** SDK Configuration */
export interface RootlessNetConfig {
  /** Storage directory for local data */
  storage?: string;
  /** Network to connect to */
  network?: "mainnet" | "testnet" | "local";
}

/** Event types */
export type EventType =
  | "identity:created"
  | "content:created"
  | "content:received"
  | "message:sent"
  | "message:received"
  | "conversation:created";

/** Event handler */
export type EventHandler<T = unknown> = (data: T) => void;

/**
 * RootlessNet Client
 * Main entry point for the SDK
 */
export class RootlessNet {
  private config: RootlessNetConfig;
  private identity: Identity | null = null;
  private sessionManager: SessionManager | null = null;
  private eventHandlers: Map<EventType, Set<EventHandler>> = new Map();
  private contentStore: Map<string, ContentObject> = new Map();

  constructor(config: RootlessNetConfig = {}) {
    this.config = {
      network: "mainnet",
      ...config,
    };
  }

  // ============ Identity Methods ============

  /**
   * Create a new identity
   */
  async createIdentity(options?: CreateIdentityOptions): Promise<Identity> {
    this.identity = await createIdentity(options);
    this.sessionManager = new SessionManager(this.identity);

    this.emit("identity:created", this.identity);

    return this.identity;
  }

  /**
   * Load an identity from encrypted backup
   */
  async loadIdentity(
    backup: ExportedIdentity,
    password: string
  ): Promise<Identity> {
    this.identity = await importIdentity(backup, password);
    this.sessionManager = new SessionManager(this.identity);

    return this.identity;
  }

  /**
   * Export the current identity
   */
  async exportIdentity(password: string): Promise<ExportedIdentity> {
    this.ensureIdentity();
    return exportIdentity(this.identity!, password);
  }

  /**
   * Get the current identity
   */
  getIdentity(): Identity | null {
    return this.identity;
  }

  /**
   * Get the current DID
   */
  getDID(): string | null {
    return this.identity?.did ?? null;
  }

  // ============ Content Methods ============

  /**
   * Create and sign content
   */
  async createContent(input: CreateContentInput): Promise<ContentObject> {
    this.ensureIdentity();

    const content = await createContent(input, this.identity!);
    this.contentStore.set(content.id, content);

    this.emit("content:created", content);

    return content;
  }

  /**
   * Create a text post
   */
  async post(
    text: string,
    options: Partial<CreateContentInput> = {}
  ): Promise<ContentObject> {
    return this.createContent({
      payload: text,
      contentType: "text/plain",
      ...options,
    });
  }

  /**
   * Reply to content
   */
  async reply(
    parentCid: string,
    text: string,
    options: Partial<CreateContentInput> = {}
  ): Promise<ContentObject> {
    return this.createContent({
      payload: text,
      contentType: "text/plain",
      parent: parentCid,
      ...options,
    });
  }

  /**
   * Verify content authenticity
   */
  async verifyContent(content: ContentObject): Promise<boolean> {
    const result = await verifyContent(content);
    return result.valid;
  }

  /**
   * Get content by CID
   */
  getContent(cid: string): ContentObject | undefined {
    return this.contentStore.get(cid);
  }

  /**
   * Decrypt content payload
   */
  decryptContent(content: ContentObject): Uint8Array {
    this.ensureIdentity();
    return decryptPayload(content, this.identity!);
  }

  /**
   * Get content text
   */
  getContentText(content: ContentObject): string {
    if (content.payload.type === "clear") {
      return getPayloadText(content);
    }

    this.ensureIdentity();
    return getPayloadText(content, this.identity!);
  }

  // ============ Messaging Methods ============

  /**
   * Get prekey bundle for sharing with others
   */
  getPrekeyBundle(): PrekeyBundle {
    this.ensureSessionManager();
    return this.sessionManager!.getPublicBundle();
  }

  /**
   * Start a conversation with a peer
   */
  async startConversation(
    recipientDid: string,
    recipientBundle: PrekeyBundle,
    recipientSigningKey: Uint8Array
  ): Promise<Conversation> {
    this.ensureSessionManager();

    const conversation = await this.sessionManager!.initiateConversation(
      recipientDid,
      recipientBundle,
      recipientSigningKey
    );

    this.emit("conversation:created", conversation);

    return conversation;
  }

  /**
   * Send a message in a conversation
   */
  sendMessage(
    conversationId: string,
    text: string,
    options?: { replyTo?: string; expiresAt?: number }
  ): DirectMessage {
    this.ensureSessionManager();

    const message = this.sessionManager!.sendMessage(
      conversationId,
      text,
      options
    );

    this.emit("message:sent", message);

    return message;
  }

  /**
   * Receive and decrypt a message
   */
  receiveMessage(message: DirectMessage): string {
    this.ensureSessionManager();

    const plaintext = this.sessionManager!.receiveMessage(message);

    this.emit("message:received", { message, plaintext });

    return new TextDecoder().decode(plaintext);
  }

  /**
   * Send an anonymous sealed message
   */
  sendSealedMessage(
    recipientEncryptionKey: Uint8Array,
    text: string
  ): SealedMessage {
    this.ensureSessionManager();
    return this.sessionManager!.sendSealedMessage(recipientEncryptionKey, text);
  }

  /**
   * Receive a sealed message
   */
  receiveSealedMessage(message: SealedMessage): string {
    this.ensureSessionManager();
    const plaintext = this.sessionManager!.receiveSealedMessage(message);
    return new TextDecoder().decode(plaintext);
  }

  /**
   * Get all conversations
   */
  getConversations(): Conversation[] {
    this.ensureSessionManager();
    return this.sessionManager!.listConversations();
  }

  // ============ Event Methods ============

  /**
   * Subscribe to events
   */
  on<T>(event: EventType, handler: EventHandler<T>): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }

    this.eventHandlers.get(event)!.add(handler as EventHandler);

    // Return unsubscribe function
    return () => {
      this.eventHandlers.get(event)?.delete(handler as EventHandler);
    };
  }

  /**
   * Emit an event
   */
  private emit(event: EventType, data: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      }
    }
  }

  // ============ Utility Methods ============

  /**
   * Parse a DID to get the public key
   */
  parseDID(did: string) {
    return parseDID(did);
  }

  /**
   * Compute CID for data
   */
  computeCID(data: Uint8Array): string {
    return computeCID(data);
  }

  // ============ Private Methods ============

  private ensureIdentity(): void {
    if (!this.identity) {
      throw new Error(
        "No identity loaded. Call createIdentity() or loadIdentity() first."
      );
    }
  }

  private ensureSessionManager(): void {
    this.ensureIdentity();
    if (!this.sessionManager) {
      throw new Error("Session manager not initialized");
    }
  }
}

// Re-export types and utilities
export * from "@rootlessnet/crypto";
export * from "@rootlessnet/identity";
export * from "@rootlessnet/content";
export * from "@rootlessnet/messaging";

// Default export
export default RootlessNet;
