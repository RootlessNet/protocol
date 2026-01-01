# RootlessNet FAQ

*Frequently asked questions about RootlessNet.*

---

## General

### What is RootlessNet?
RootlessNet is a decentralized protocol for censorship-resistant human expression. It's not a platform or company—it's infrastructure anyone can build on.

### Why "Rootless"?
No central root of trust. No root administrator. No rooted ownership. Power is distributed, not concentrated.

### Is RootlessNet a social network?
No. RootlessNet is a **protocol** like email or HTTP. Social networks can be built on top of it.

### How is RootlessNet different from existing social platforms?
- **You own your identity** — keys live with you
- **You own your data** — take it anywhere
- **No central moderation** — local choices only
- **No single point of failure** — distributed by design

---

## Identity & Privacy

### Do I need to use my real name?
No. Identities are key-based. You can use any pseudonym or remain fully anonymous with ephemeral identities.

### Can my identity be banned?
Not at the protocol level. Individual clients or zones can block you locally, but your identity persists.

### What if I lose my keys?
Set up recovery before this happens:
- Social recovery (trusted contacts)
- Hardware backup
- Seed phrase

### Who can see my data?
- Public content: Anyone
- Zone content: Zone members
- Private messages: Only recipients
- Encrypted content: Only key holders

---

## Content & Moderation

### Can content be deleted?
No global deletion exists. You can:
- Hide your own content
- Request zones remove it
- Revoke encryption keys

But others may have copies.

### What about illegal content?
- Clients can filter known hashes
- Zones can set moderation rules
- Users can report and block
- Legal liability falls on those who host/share

### How does moderation work?
Moderation is **local**, not global:
- Users choose their filters
- Clients set defaults
- Zones set community rules
- No one controls everything

### Can I block someone?
Yes, at the client level. They can still exist; you just won't see them.

---

## Technical

### What cryptography does RootlessNet use?
- Ed25519 for signatures
- X25519 for key exchange
- XChaCha20-Poly1305 for encryption
- BLAKE3 for hashing

### Is RootlessNet quantum-resistant?
Not yet. Post-quantum migration is planned for 2025-2026.

### How does sync work?
Nodes gossip content to peers. When you connect, you sync what you're subscribed to.

### Can I run my own node?
Yes! Full nodes require moderate resources. Light clients work on any device.

### What platforms are supported?
- Desktop (Windows, macOS, Linux)
- Mobile (iOS, Android)
- Web browser
- CLI

---

## Zones & Communities

### What is a Zone?
A Zone is a social context with shared norms—like a subreddit or Discord server, but decentralized.

### Can anyone create a Zone?
Yes. Zones are permissionless.

### How are Zones moderated?
Zone creators set initial rules. Governance models include:
- Single owner
- Council voting
- Full democracy
- Reputation-weighted

### Can a Zone be taken down?
Not by the protocol. If zone content is replicated across nodes, it persists.

---

## Messaging

### Are messages encrypted?
Yes. All private messages use end-to-end encryption.

### Can group chats be decrypted by admins?
No. Group chats use MLS (Message Layer Security). No one outside the group can read messages.

### Are messages stored forever?
By default, yes. Ephemeral messages with auto-delete are available.

---

## Economics

### Does RootlessNet have a token?
No native token currently. Future economics are intentionally open.

### Who pays for infrastructure?
- Users run their own nodes, or
- Use hosted services (potentially paid), or
- Community/volunteer nodes

### Is RootlessNet a nonprofit?
The protocol specification is a public good. Implementations vary.

---

## Development

### Is RootlessNet open source?
Yes. MIT license for most components.

### How can I contribute?
See CONTRIBUTING.md:
- Code contributions
- Documentation
- Bug reports
- Feature ideas

### Where is the source code?
The protocol source code is available on GitHub.

---

## Safety

### Is RootlessNet safe?
Safety is contextual. RootlessNet provides:
- Strong encryption
- Anonymity options
- Local filtering

But cannot prevent:
- Content you choose to view
- Bad actors existing
- Social conflicts

### What about harassment?
Use blocking, filtering, and zone moderation. No global solution exists by design—local control means local responsibility.

---

## Philosophy

### Why can't content be globally deleted?
Global deletion requires global authority. That authority can be captured, corrupted, or coerced. Local choices preserve freedom.

### Isn't this enabling bad actors?
The same tools that protect dissidents protect others. The design prioritizes structural freedom over perfect outcomes.

### Who decides what's acceptable?
You do, for yourself. Zones do, for their communities. No one does, globally.

---

*More questions? Reach out to the contributors.*

*Last Updated: December 2024*
