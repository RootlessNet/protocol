/**
 * RootlessNet Network
 * Basic peer discovery and message transport
 */

export interface PeerInfo {
  did: string;
  addresses: string[];
  publicKey: Uint8Array;
  lastSeen: number;
}

export type MessageType = "ping" | "pong" | "content" | "sync" | "message";

export interface NetworkMessage {
  type: MessageType;
  sender: string; // DID
  payload: Uint8Array;
  signature: Uint8Array;
}

/**
 * Abstract Network Interface
 */
export class Node {
  private peers = new Map<string, PeerInfo>();
  private handlers = new Map<MessageType, Set<(msg: NetworkMessage) => void>>();

  constructor(public did: string) {}

  async connect(address: string): Promise<void> {
    console.log(`Connecting to ${address}...`);
    // In a real implementation, this would establish a LibP2P or WebSocket connection
  }

  async broadcast(type: MessageType, payload: Uint8Array): Promise<void> {
    console.log(`Broadcasting ${type} message...`);
    // Gossip protocol implementation would go here
  }

  async sendTo(
    peerDid: string,
    type: MessageType,
    payload: Uint8Array
  ): Promise<void> {
    const peer = this.peers.get(peerDid);
    if (!peer) throw new Error("Peer not found");
    console.log(`Sending ${type} to ${peerDid}...`);
  }

  on(type: MessageType, handler: (msg: NetworkMessage) => void) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
  }

  off(type: MessageType, handler: (msg: NetworkMessage) => void) {
    this.handlers.get(type)?.delete(handler);
  }

  protected emit(msg: NetworkMessage) {
    this.handlers.get(msg.type)?.forEach((h) => h(msg));
  }

  getPeers(): PeerInfo[] {
    return Array.from(this.peers.values());
  }
}
