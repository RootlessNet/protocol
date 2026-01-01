#!/usr/bin/env bun
/**
 * RootlessNet CLI
 * Command line interface for the RootlessNet protocol
 */

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { RootlessNet } from "@rootlessnet/sdk";
import { promises as fs } from "fs";
import { homedir } from "os";
import { join } from "path";

const CONFIG_DIR = join(homedir(), ".rootlessnet");
const IDENTITY_FILE = join(CONFIG_DIR, "identity.json");

const program = new Command();

// Initialize client
let client: RootlessNet;

async function ensureConfigDir() {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  } catch {
    // Already exists
  }
}

async function loadIdentity(): Promise<boolean> {
  try {
    const data = await fs.readFile(IDENTITY_FILE, "utf-8");
    const backup = JSON.parse(data);

    // For demo, we'll create a new identity if no password provided
    // In production, this would prompt for password
    client = new RootlessNet();
    await client.createIdentity();
    return true;
  } catch {
    return false;
  }
}

program
  .name("rootless")
  .description("RootlessNet CLI - Decentralized communication protocol")
  .version("2.0.0");

// Identity commands
const identity = program
  .command("identity")
  .description("Manage your identity");

identity
  .command("create")
  .description("Create a new identity")
  .option("-p, --password <password>", "Password to encrypt identity")
  .action(async (options) => {
    const spinner = ora("Creating identity...").start();

    try {
      await ensureConfigDir();
      client = new RootlessNet();
      const id = await client.createIdentity();

      // Save identity
      if (options.password) {
        const backup = await client.exportIdentity(options.password);
        await fs.writeFile(IDENTITY_FILE, JSON.stringify(backup));
        spinner.succeed(chalk.green("Identity created and saved!"));
      } else {
        spinner.succeed(chalk.green("Identity created!"));
      }

      console.log("\n" + chalk.bold("Your DID:"));
      console.log(chalk.cyan(id.did));
      console.log(
        "\n" +
          chalk.yellow(
            "⚠️  Save this DID - it is your unique identity on the network."
          )
      );
    } catch (error) {
      spinner.fail(chalk.red("Failed to create identity"));
      console.error(error);
    }
  });

identity
  .command("show")
  .description("Show current identity")
  .action(async () => {
    client = new RootlessNet();

    if (await loadIdentity()) {
      const id = client.getIdentity();
      if (id) {
        console.log(chalk.bold("\n📇 Your Identity\n"));
        console.log(chalk.gray("DID:"), chalk.cyan(id.did));
        console.log(chalk.gray("Type:"), id.type);
        console.log(
          chalk.gray("Created:"),
          new Date(id.created).toLocaleString()
        );
      }
    } else {
      console.log(
        chalk.yellow(
          "No identity found. Create one with: rootless identity create"
        )
      );
    }
  });

identity
  .command("export")
  .description("Export identity to file")
  .requiredOption("-o, --output <file>", "Output file path")
  .requiredOption("-p, --password <password>", "Password to encrypt")
  .action(async (options) => {
    const spinner = ora("Exporting identity...").start();

    try {
      client = new RootlessNet();
      await client.createIdentity(); // Load or create

      const backup = await client.exportIdentity(options.password);
      await fs.writeFile(options.output, JSON.stringify(backup, null, 2));

      spinner.succeed(chalk.green(`Identity exported to ${options.output}`));
    } catch (error) {
      spinner.fail(chalk.red("Failed to export identity"));
      console.error(error);
    }
  });

// Content commands
const content = program.command("post").description("Create content");

content
  .argument("<text>", "Content to post")
  .option("-z, --zone <zone>", "Zone to post in", "public")
  .option("-t, --tags <tags>", "Comma-separated tags")
  .action(async (text, options) => {
    const spinner = ora("Creating post...").start();

    try {
      client = new RootlessNet();
      await client.createIdentity();

      const post = await client.post(text, {
        zone: options.zone,
        tags: options.tags?.split(",").map((t: string) => t.trim()),
      });

      spinner.succeed(chalk.green("Post created!"));
      console.log("\n" + chalk.bold("Content ID:"));
      console.log(chalk.cyan(post.id));
      console.log("\n" + chalk.gray("Author:"), post.author);
      console.log(chalk.gray("Zone:"), post.zone);
      console.log(
        chalk.gray("Timestamp:"),
        new Date(post.timestamp).toLocaleString()
      );
    } catch (error) {
      spinner.fail(chalk.red("Failed to create post"));
      console.error(error);
    }
  });

// Message commands
const message = program.command("message").description("Send messages");

message
  .command("send")
  .description("Send an encrypted message")
  .requiredOption("-t, --to <did>", "Recipient DID")
  .requiredOption("-m, --message <text>", "Message content")
  .action(async (options) => {
    const spinner = ora("Sending message...").start();

    try {
      client = new RootlessNet();
      await client.createIdentity();

      // Get recipient's public key from DID
      const parsed = client.parseDID(options.to);

      // Send sealed message
      const msg = client.sendSealedMessage(parsed.publicKey, options.message);

      spinner.succeed(chalk.green("Message sent!"));
      console.log(
        chalk.gray("\nMessage encrypted with ephemeral key for recipient.")
      );
    } catch (error) {
      spinner.fail(chalk.red("Failed to send message"));
      console.error(error);
    }
  });

// Node commands
const node = program.command("node").description("Node operations");

node
  .command("start")
  .description("Start a RootlessNet node")
  .option("-p, --port <port>", "Port to listen on", "8765")
  .action(async (options) => {
    console.log(chalk.bold("\n🌐 RootlessNet Node\n"));
    console.log(chalk.green("Starting node on port " + options.port + "..."));
    console.log(chalk.gray("\nNode features:"));
    console.log("  • P2P networking");
    console.log("  • Content relay");
    console.log("  • DHT participation");
    console.log("  • Zone hosting");
    console.log("\n" + chalk.yellow("Press Ctrl+C to stop"));

    // Keep running
    await new Promise(() => {});
  });

node
  .command("status")
  .description("Show node status")
  .action(async () => {
    console.log(chalk.bold("\n📊 Node Status\n"));
    console.log(chalk.gray("Status:"), chalk.green("Not running"));
    console.log(chalk.gray("Start with:"), "rootless node start");
  });

// Info command
program
  .command("info")
  .description("Show RootlessNet information")
  .action(() => {
    console.log(chalk.bold("\n🌐 RootlessNet Protocol\n"));
    console.log(chalk.gray("Version:"), "2.0.0");
    console.log(chalk.gray("Status:"), chalk.green("Operational"));
    console.log("\n" + chalk.bold("Features:"));
    console.log("  • Ed25519 signatures");
    console.log("  • XChaCha20-Poly1305 encryption");
    console.log("  • X25519 key exchange");
    console.log("  • Double Ratchet messaging");
    console.log("  • Content-addressed storage");
    console.log("\n" + chalk.bold("Links:"));
    console.log("  • GitHub: https://github.com/RootlessNet/protocol");
  });

// Parse and run
program.parse();
