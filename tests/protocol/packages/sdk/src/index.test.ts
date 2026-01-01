/**
 * RootlessNet SDK Integration Tests
 */

import { describe, test, expect } from "bun:test";
import { RootlessNet } from "../src/index.js";

describe("RootlessNet SDK", () => {
  test("creates identity", async () => {
    const client = new RootlessNet();
    const identity = await client.createIdentity();

    expect(identity.did).toMatch(/^did:rootless:key:/);
    expect(identity.type).toBe("persistent");
    expect(identity.keySet.signing.publicKey.length).toBe(32);
  });

  test("creates and verifies content", async () => {
    const client = new RootlessNet();
    await client.createIdentity();

    const content = await client.post("Hello, RootlessNet!");

    expect(content.id).toBeDefined();
    expect(content.author).toBe(client.getDID());
    expect(content.signature.length).toBe(64);

    const valid = await client.verifyContent(content);
    expect(valid).toBe(true);
  });

  test("encrypts content for recipients", async () => {
    const alice = new RootlessNet();
    const bob = new RootlessNet();

    await alice.createIdentity();
    await bob.createIdentity();

    // Get Bob's public key
    const bobParsed = alice.parseDID(bob.getDID()!);

    const content = await alice.createContent({
      payload: "Secret message for Bob",
      encryption: "recipients",
      recipients: [bob.getDID()!],
    });

    expect(content.payloadEncryption).toBe("recipients");
    expect(content.payload.type).toBe("encrypted");
  });

  test("messaging between users", async () => {
    const alice = new RootlessNet();
    const bob = new RootlessNet();

    await alice.createIdentity();
    await bob.createIdentity();

    // Get prekey bundles
    const aliceBundle = alice.getPrekeyBundle();
    const bobBundle = bob.getPrekeyBundle();

    expect(aliceBundle.identityKey.length).toBe(32);
    expect(bobBundle.signedPrekey.publicKey.length).toBe(32);
  });

  test("exports and imports identity", async () => {
    const client = new RootlessNet();
    const original = await client.createIdentity();

    const backup = await client.exportIdentity("password123");
    expect(backup.encrypted).toBe(true);
    expect(backup.kdf?.algorithm).toBe("argon2id");

    const client2 = new RootlessNet();
    const restored = await client2.loadIdentity(backup, "password123");

    expect(restored.did).toBe(original.did);
  });

  test("event handling", async () => {
    const client = new RootlessNet();

    let eventFired = false;
    client.on("identity:created", () => {
      eventFired = true;
    });

    await client.createIdentity();

    expect(eventFired).toBe(true);
  });
});
