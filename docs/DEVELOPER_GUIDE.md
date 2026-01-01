# RootlessNet Developer Guide

*A comprehensive guide for developers building on RootlessNet.*

---

## 1. Getting Started

### 1.1 Prerequisites

- Node.js 18+ or Bun 1.0+
- Rust 1.70+ (optional, for native modules)
- Docker (optional, for running nodes)

### 1.2 Installation

```bash
# Using bun
bun add @rootlessnet/sdk

# Or install CLI
bun add -g @rootlessnet/cli
```

### 1.3 Quick Start

```typescript
import { RootlessNet } from '@rootlessnet/sdk';

// Initialize client
const client = new RootlessNet({
  network: 'mainnet',
  storage: './data',
});

// Create or load identity
const identity = await client.identity.create();
console.log('Your DID:', identity.did);

// Post content
const post = await client.content.create({
  type: 'text/plain',
  payload: 'Hello, RootlessNet!',
  zone: 'public',
});
console.log('Posted:', post.id);
```

---

## 2. Core Concepts

### 2.1 Identity

Identities are self-sovereign and key-based.

```typescript
// Generate new identity
const identity = await client.identity.create({
  type: 'persistent', // or 'ephemeral'
});

// Export for backup
const backup = await client.identity.export(identity.did, 'passphrase');

// Import from backup
const restored = await client.identity.import(backup, 'passphrase');

// Sign data
const signature = await client.identity.sign(identity.did, data);

// Verify signature
const valid = await client.identity.verify(did, data, signature);
```

### 2.2 Content

All content is signed and content-addressed.

```typescript
// Create content
const content = await client.content.create({
  type: 'text/markdown',
  payload: '# Hello World\n\nThis is my first post.',
  zone: 'my-zone',
  tags: ['intro', 'hello'],
});

// Get content by CID
const fetched = await client.content.get(content.id);

// Reply to content
const reply = await client.content.create({
  type: 'text/plain',
  payload: 'Great post!',
  parent: content.id,
});

// Query content
const results = await client.content.query({
  zone: 'my-zone',
  author: someDid,
  limit: 50,
});
```

### 2.3 Zones

Zones are social contexts for content.

```typescript
// Create zone
const zone = await client.zones.create({
  name: 'My Community',
  visibility: 'public',
  joinPolicy: 'open',
});

// Join zone
await client.zones.join(zoneId);

// Leave zone
await client.zones.leave(zoneId);

// List zone content
const feed = await client.zones.getFeed(zoneId, {
  algorithm: 'chronological',
  limit: 50,
});
```

### 2.4 Messaging

Private, encrypted messaging.

```typescript
// Start conversation
const conv = await client.messaging.startConversation([recipientDid]);

// Send message
await client.messaging.send(conv.id, {
  type: 'text/plain',
  payload: 'Hello!',
});

// Listen for messages
client.messaging.on('message', (message) => {
  console.log('New message:', message);
});

// Get conversation history
const messages = await client.messaging.getMessages(conv.id, {
  limit: 50,
  before: someMessageId,
});
```

---

## 3. Advanced Usage

### 3.1 Custom Feed Algorithms

```typescript
import { FeedAlgorithm, ContentObject } from '@rootlessnet/sdk';

const myAlgorithm: FeedAlgorithm = {
  name: 'my-algorithm',
  version: '1.0.0',
  
  rank(content: ContentObject[], context): RankedContent[] {
    return content
      .map(c => ({
        content: c,
        score: calculateScore(c, context),
      }))
      .sort((a, b) => b.score - a.score);
  },
  
  explainRanking(content) {
    return {
      score: calculateScore(content),
      factors: ['recency', 'trust', 'engagement'],
    };
  },
};

client.feeds.registerAlgorithm(myAlgorithm);
```

### 3.2 Plugins

```typescript
import { Plugin, PluginContext } from '@rootlessnet/sdk';

const myPlugin: Plugin = {
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',
  permissions: ['content:read', 'content:write'],
  
  async initialize(ctx: PluginContext) {
    console.log('Plugin initialized');
  },
  
  async activate() {
    // Hook into content creation
    ctx.events.on('content:beforeCreate', (content) => {
      // Modify or validate content
    });
  },
  
  async deactivate() {
    // Cleanup
  },
};

client.plugins.register(myPlugin);
```

### 3.3 Custom Transports

```typescript
import { Transport } from '@rootlessnet/sdk';

const myTransport: Transport = {
  name: 'my-transport',
  
  async connect(peer: PeerAddress): Promise<Connection> {
    // Implement connection logic
  },
  
  async listen(port: number): Promise<Listener> {
    // Implement listener
  },
};

client.network.addTransport(myTransport);
```

---

## 4. Event Handling

### 4.1 Available Events

```typescript
// Content events
client.on('content:new', (content) => { });
client.on('content:hidden', (cid) => { });

// Messaging events
client.on('message:received', (message) => { });
client.on('message:read', (conversationId, messageId) => { });

// Zone events
client.on('zone:joined', (zone) => { });
client.on('zone:left', (zoneId) => { });
client.on('zone:updated', (zone) => { });

// Network events
client.on('peer:connected', (peer) => { });
client.on('peer:disconnected', (peerId) => { });
client.on('sync:complete', (stats) => { });

// Identity events
client.on('identity:created', (identity) => { });
client.on('identity:rotated', (did, newKey) => { });
```

---

## 5. CLI Reference

### 5.1 Identity Commands

```bash
# Create identity
rootless identity create

# List identities
rootless identity list

# Export identity
rootless identity export <did> -o backup.enc

# Import identity
rootless identity import backup.enc
```

### 5.2 Content Commands

```bash
# Post content
rootless post "Hello, world!"

# Post with options
rootless post -z my-zone -t tag1,tag2 "Content here"

# Get content
rootless get <cid>

# Search content
rootless search --zone my-zone --author <did>
```

### 5.3 Zone Commands

```bash
# Create zone
rootless zone create "My Zone" --visibility public

# Join zone
rootless zone join <zone-id>

# List zones
rootless zone list

# Zone feed
rootless zone feed <zone-id>
```

### 5.4 Node Commands

```bash
# Start node
rootless node start

# Node status
rootless node status

# Connect to peer
rootless node connect <peer-address>

# List peers
rootless node peers
```

---

## 6. Configuration

### 6.1 Configuration File

```yaml
# ~/.rootlessnet/config.yaml

network:
  type: mainnet  # or testnet, local
  bootstrapNodes:
    - /ip4/1.2.3.4/tcp/4001/p2p/QmXxx
  
identity:
  default: did:rootless:key:z6Mkxxxx
  
storage:
  path: ~/.rootlessnet/data
  maxSize: 10GB
  
transports:
  - libp2p
  - websocket
  
logging:
  level: info
  file: ~/.rootlessnet/logs/app.log
```

### 6.2 Environment Variables

| Variable | Description |
|----------|-------------|
| `ROOTLESS_NETWORK` | Network type |
| `ROOTLESS_DATA_DIR` | Data directory |
| `ROOTLESS_LOG_LEVEL` | Logging level |
| `ROOTLESS_BOOTSTRAP` | Bootstrap nodes |

---


### 7.1 SDK Methods

| Module | Method | Description |
|--------|--------|-------------|
| identity | create() | Create identity |
| identity | export() | Export identity |
| identity | import() | Import identity |
| content | create() | Create content |
| content | get() | Get by CID |
| content | query() | Query content |
| zones | create() | Create zone |
| zones | join() | Join zone |
| zones | leave() | Leave zone |
| messaging | send() | Send message |
| messaging | getMessages() | Get messages |

---

## 8. Testing

### 8.1 Unit Testing

```typescript
import { createTestClient } from '@rootlessnet/testing';

describe('Content', () => {
  let client: TestClient;
  
  beforeEach(async () => {
    client = await createTestClient();
  });
  
  it('should create content', async () => {
    const content = await client.content.create({
      type: 'text/plain',
      payload: 'Test',
    });
    
    expect(content.id).toBeDefined();
  });
});
```

### 8.2 Integration Testing

```typescript
import { createTestNetwork } from '@rootlessnet/testing';

describe('Sync', () => {
  it('should sync content between nodes', async () => {
    const { nodes } = await createTestNetwork(3);
    
    const content = await nodes[0].content.create({
      type: 'text/plain',
      payload: 'Test',
    });
    
    await waitForSync(nodes);
    
    const synced = await nodes[2].content.get(content.id);
    expect(synced).toBeDefined();
  });
});
```

---

## 9. Troubleshooting

### 9.1 Common Issues

| Issue | Solution |
|-------|----------|
| Cannot connect to peers | Check firewall, try relay |
| Sync not working | Verify network config |
| Signature invalid | Check key is not rotated |
| Message decryption fails | Verify recipient key |

### 9.2 Debug Mode

```bash
# Enable debug logging
ROOTLESS_LOG_LEVEL=debug rootless node start

# Network debugging
rootless network diagnose
```

---

## 10. Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### 10.1 Development Setup

```bash
git clone https://github.com/rootlessnet/protocol
cd rootlessnet
bun install
bun run dev
```

### 10.2 Running Tests

```bash
bun test           # Unit tests
bun test:e2e       # E2E tests
bun test:coverage  # With coverage
```

---

*Document Version: 1.0.0 | Last Updated: December 2024*
