/**
 * RootlessNet Storage
 * Abstract storage interface and implementations
 */

/** Core storage interface */
export interface Storage {
  get(key: string): Promise<Uint8Array | null>;
  set(key: string, value: Uint8Array): Promise<void>;
  delete(key: string): Promise<void>;
  list(prefix?: string): Promise<string[]>;
  clear(): Promise<void>;
}

/** In-memory storage implementation */
export class MemoryStorage implements Storage {
  private data = new Map<string, Uint8Array>();

  async get(key: string): Promise<Uint8Array | null> {
    return this.data.get(key) ?? null;
  }

  async set(key: string, value: Uint8Array): Promise<void> {
    this.data.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.data.delete(key);
  }

  async list(prefix?: string): Promise<string[]> {
    const keys = Array.from(this.data.keys());
    if (prefix) {
      return keys.filter((k) => k.startsWith(prefix));
    }
    return keys;
  }

  async clear(): Promise<void> {
    this.data.clear();
  }
}

/** File-system backed storage (Node/Bun) */
export class FileStorage implements Storage {
  constructor(private baseDir: string) {}

  private async getPath(key: string): Promise<string> {
    const { join } = await import("path");
    const { existsSync, mkdirSync } = await import("fs");

    if (!existsSync(this.baseDir)) {
      mkdirSync(this.baseDir, { recursive: true });
    }

    return join(this.baseDir, key.replace(/\//g, "_"));
  }

  async get(key: string): Promise<Uint8Array | null> {
    const { promises: fs } = await import("fs");
    const path = await this.getPath(key);
    try {
      return new Uint8Array(await fs.readFile(path));
    } catch {
      return null;
    }
  }

  async set(key: string, value: Uint8Array): Promise<void> {
    const { promises: fs } = await import("fs");
    const path = await this.getPath(key);
    await fs.writeFile(path, value);
  }

  async delete(key: string): Promise<void> {
    const { promises: fs } = await import("fs");
    const path = await this.getPath(key);
    try {
      await fs.unlink(path);
    } catch {}
  }

  async list(prefix?: string): Promise<string[]> {
    const { promises: fs } = await import("fs");
    try {
      const files = await fs.readdir(this.baseDir);
      if (prefix) {
        return files.filter((f) => f.startsWith(prefix.replace(/\//g, "_")));
      }
      return files;
    } catch {
      return [];
    }
  }

  async clear(): Promise<void> {
    const { promises: fs } = await import("fs");
    try {
      const files = await fs.readdir(this.baseDir);
      for (const file of files) {
        const { join } = await import("path");
        await fs.unlink(join(this.baseDir, file));
      }
    } catch {}
  }
}

/** IndexedDB storage for browsers */
export class BrowserStorage implements Storage {
  private dbName: string;
  private storeName: string;

  constructor(dbName = "rootlessnet", storeName = "objects") {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  private async getDB() {
    const { openDB } = await import("idb");
    const store = this.storeName;
    return openDB(this.dbName, 1, {
      upgrade(db) {
        db.createObjectStore(store);
      },
    });
  }

  async get(key: string): Promise<Uint8Array | null> {
    const db = await this.getDB();
    return (await db.get(this.storeName, key)) ?? null;
  }

  async set(key: string, value: Uint8Array): Promise<void> {
    const db = await this.getDB();
    await db.put(this.storeName, value, key);
  }

  async delete(key: string): Promise<void> {
    const db = await this.getDB();
    await db.delete(this.storeName, key);
  }

  async list(prefix?: string): Promise<string[]> {
    const db = await this.getDB();
    const keys = await db.getAllKeys(this.storeName);
    const stringKeys = keys.map((k) => String(k));
    if (prefix) {
      return stringKeys.filter((k) => k.startsWith(prefix));
    }
    return stringKeys;
  }

  async clear(): Promise<void> {
    const db = await this.getDB();
    await db.clear(this.storeName);
  }
}

/** Store factory functions */
export function createStorage(config?: {
  baseDir?: string;
  type?: "memory" | "file" | "browser";
}): Storage {
  if (config?.type === "memory") return new MemoryStorage();
  if (config?.type === "file" && config.baseDir)
    return new FileStorage(config.baseDir);
  if (config?.type === "browser") return new BrowserStorage();

  // Default detection
  if (typeof window !== "undefined" && window.indexedDB) {
    return new BrowserStorage();
  }

  const dir = config?.baseDir ?? "./.rootless_storage";
  return new FileStorage(dir);
}
