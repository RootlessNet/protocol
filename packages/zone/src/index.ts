import {
  generateEncryptionKeyPair,
  signHash,
  verifyHash,
  computeCID,
  type SigningKeyPair,
  type EncryptionKeyPair,
} from "@rootlessnet/crypto";
import type { Identity } from "@rootlessnet/identity";

/** Zone Metadata */
export interface ZoneMetadata {
  id: string; // CID of creation object
  name: string;
  description?: string;
  creator: string; // DID
  created: number;
}

/** Zone Member */
export interface ZoneMember {
  did: string;
  role: "admin" | "moderator" | "member";
  joined: number;
  encryptionPublicKey: Uint8Array;
}

/** Zone Configuration */
export interface Zone {
  metadata: ZoneMetadata;
  members: Map<string, ZoneMember>;
  zoneKey: Uint8Array; // Shared encryption key for the zone
}

/** Zone Manager */
export class ZoneManager {
  private zones = new Map<string, Zone>();

  constructor(private identity: Identity) {}

  /** Create a new zone */
  async createZone(name: string, description?: string): Promise<Zone> {
    const id = `zone:${computeCID(
      new TextEncoder().encode(name + Date.now())
    )}`;

    // Generate zone encryption key (shared among members)
    // In a production MLS implementation, this would be managed by MLS
    const zoneKey = generateEncryptionKeyPair().privateKey;

    const zone: Zone = {
      metadata: {
        id,
        name,
        description,
        creator: this.identity.did,
        created: Date.now(),
      },
      members: new Map(),
      zoneKey,
    };

    // Add creator as admin
    zone.members.set(this.identity.did, {
      did: this.identity.did,
      role: "admin",
      joined: Date.now(),
      encryptionPublicKey: this.identity.keySet.encryption.publicKey,
    });

    this.zones.set(id, zone);
    return zone;
  }

  /** Join a zone */
  async addMember(
    zoneId: string,
    memberDid: string,
    encryptionPublicKey: Uint8Array,
    role: ZoneMember["role"] = "member"
  ) {
    const zone = this.zones.get(zoneId);
    if (!zone) throw new Error("Zone not found");

    // Check if current user is admin/mod
    const currentMember = zone.members.get(this.identity.did);
    if (
      !currentMember ||
      (currentMember.role !== "admin" && currentMember.role !== "moderator")
    ) {
      throw new Error("Unauthorized to add members");
    }

    zone.members.set(memberDid, {
      did: memberDid,
      role,
      joined: Date.now(),
      encryptionPublicKey,
    });
  }

  getZone(zoneId: string): Zone | undefined {
    return this.zones.get(zoneId);
  }

  listZones(): ZoneMetadata[] {
    return Array.from(this.zones.values()).map((z) => z.metadata);
  }
}
