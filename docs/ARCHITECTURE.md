# RootlessNet Architecture

*Technical architecture documentation for the RootlessNet protocol.*

---

## 1. System Overview

RootlessNet is a decentralized communication protocol designed for censorship-resistant expression.

### 1.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────┐
│                  Clients (Desktop/Mobile/Web)         │
├──────────────────────────────────────────────────────┤
│                  Protocol Layer                       │
├──────────────────────────────────────────────────────┤
│     P2P Network    │    Relays    │    Storage       │
└──────────────────────────────────────────────────────┘
```

---

## 2. Component Architecture

### 2.1 Client Components

| Component | Responsibility |
|-----------|---------------|
| Content Manager | Create, retrieve, cache content |
| Identity Manager | Key generation, signing |
| Messaging Manager | E2E encryption, delivery |
| Zone Manager | Communities, moderation |
| Sync Engine | Data synchronization |
| Key Store | Secure key storage |

### 2.2 Protocol Components

| Component | Responsibility |
|-----------|---------------|
| Signing Engine | Signature creation/verification |
| Encryption Engine | Symmetric/asymmetric encryption |
| Network I/O | P2P and relay communication |
| DHT | Distributed hash table |

---

## 3. Data Model

### 3.1 Core Entities

```typescript
interface Identity {
  did: DID;
  publicKeys: PublicKey[];
  created: Timestamp;
}

interface ContentObject {
  id: CID;
  author: DID;
  zone: ZoneID;
  parent?: CID;
  payload: Payload;
  timestamp: Timestamp;
  signature: Signature;
}

interface Zone {
  id: ZoneID;
  name: string;
  creator: DID;
  moderators: DID[];
  config: ZoneConfig;
}

interface Message {
  id: MessageID;
  conversation: ConversationID;
  sender: DID;
  ciphertext: Uint8Array;
  timestamp: Timestamp;
}
```

### 3.2 Storage Schema

```sql
CREATE TABLE identities (
  did TEXT PRIMARY KEY,
  public_key BLOB NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE content (
  cid TEXT PRIMARY KEY,
  author_did TEXT NOT NULL,
  zone_id TEXT,
  payload BLOB NOT NULL,
  timestamp INTEGER NOT NULL,
  signature BLOB NOT NULL
);

CREATE TABLE zones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  creator_did TEXT NOT NULL,
  config TEXT NOT NULL
);
```

---

## 4. Network Architecture

### 4.1 Node Types

| Type | Role | Resources |
|------|------|-----------|
| Bootstrap | Entry point | High |
| Full Node | Network backbone | High |
| Light Node | End user | Low |
| Relay Node | NAT traversal | Medium |
| Archive Node | Historical data | Very High |

### 4.2 Peer Discovery

- Bootstrap nodes (hardcoded)
- mDNS for local network
- DHT (Kademlia)
- Peer exchange (PEX)

### 4.3 Transport Protocols

| Protocol | Use Case |
|----------|----------|
| libp2p | Default P2P |
| WebSocket | Browser clients |
| WebRTC | Direct P2P |
| Tor | Anonymous |

---

## 5. Sync Protocol

### 5.1 Sync Strategy

1. **Initial Sync**: Download all zone content
2. **Incremental Sync**: Exchange heads, fetch missing
3. **Real-time Sync**: Push notifications for new content

### 5.2 Messages

```typescript
type SyncMessage = 
  | { type: 'SYNC_REQUEST'; since: CID; zones: ZoneID[] }
  | { type: 'SYNC_RESPONSE'; content: ContentObject[] }
  | { type: 'HEAD_EXCHANGE'; heads: Map<ZoneID, CID> }
  | { type: 'CONTENT_PUSH'; content: ContentObject[] };
```

---

## 6. API Architecture

### 6.1 REST Endpoints

```
POST /identity         - Create identity
GET  /identity/:did    - Get identity
POST /content          - Create content
GET  /content/:cid     - Get content
GET  /feed             - Get feed
POST /zones            - Create zone
POST /zones/:id/join   - Join zone
POST /messages         - Send message
GET  /messages         - Get messages
```

### 6.2 WebSocket Events

```typescript
interface Events {
  'content:new': (content: ContentObject) => void;
  'message:received': (message: Message) => void;
  'zone:updated': (zone: Zone) => void;
  'peer:connected': (peer: PeerInfo) => void;
}
```

---

## 7. Plugin Architecture

### 7.1 Plugin Interface

```typescript
interface Plugin {
  id: string;
  name: string;
  version: string;
  
  initialize(context: PluginContext): Promise<void>;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  
  contentTypes?: ContentTypeHandler[];
  feedAlgorithms?: FeedAlgorithm[];
}
```

### 7.2 Permissions

| Permission | Risk Level |
|------------|------------|
| content:read | Low |
| content:write | Medium |
| identity:sign | High |
| messaging:read | High |
| network:request | Medium |

---

## 8. Scaling

### 8.1 Strategies

| Strategy | Use Case |
|----------|----------|
| Zone sharding | High volume |
| Node replication | Availability |
| Edge caching | Global access |
| Selective sync | Mobile |

### 8.2 Performance Config

```typescript
interface Config {
  cache: { contentTTL: 3600, maxSize: 1024 };
  connections: { maxPeers: 50, minPeers: 5 };
  batching: { batchSize: 100, timeout: 1000 };
}
```

---

## 9. Deployment

### 9.1 Docker

```yaml
version: '3.8'
services:
  node:
    image: rootlessnet/node:latest
    ports: ["4001:4001", "8080:8080"]
    volumes: ["./data:/data"]
```

### 9.2 Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 4 GB | 8+ GB |
| Storage | 50 GB | 500+ GB |

---

## 10. Monitoring

### 10.1 Metrics

- `system.cpu_usage` - CPU usage
- `network.peers_connected` - Connected peers
- `content.total_objects` - Content count
- `sync.pending_objects` - Sync queue
- `api.requests_total` - API requests

### 10.2 Health Checks

```typescript
interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: {
    database: ComponentHealth;
    network: ComponentHealth;
    sync: ComponentHealth;
  };
}
```

---

*Document Version: 1.0.0 | Last Updated: December 2024*
