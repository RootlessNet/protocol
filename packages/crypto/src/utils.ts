/**
 * RootlessNet Secure Memory Utilities
 * Zeroization and constant-time operations
 */

/**
 * Securely zero out a buffer
 * Overwrites with random data first, then zeros
 */
export function zeroize(buffer: Uint8Array): void {
  // First pass: overwrite with random
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(buffer);
  }

  // Second pass: zero out
  buffer.fill(0);
}

/**
 * Constant-time comparison of two byte arrays
 * Prevents timing attacks
 */
export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }

  return result === 0;
}

/**
 * Constant-time conditional select
 * Returns a if condition is true, b otherwise
 */
export function constantTimeSelect(
  condition: boolean,
  a: Uint8Array,
  b: Uint8Array
): Uint8Array {
  if (a.length !== b.length) {
    throw new Error("Arrays must have same length");
  }

  const mask = condition ? 0xff : 0x00;
  const result = new Uint8Array(a.length);

  for (let i = 0; i < a.length; i++) {
    result[i] = (a[i] & mask) | (b[i] & ~mask);
  }

  return result;
}

/**
 * Concatenate multiple byte arrays
 */
export function concat(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);

  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }

  return result;
}

/**
 * Convert bytes to hex string
 */
export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Convert hex string to bytes
 */
export function fromHex(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error("Invalid hex string");
  }

  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }

  return bytes;
}

/**
 * Convert bytes to base64 string
 */
export function toBase64(bytes: Uint8Array): string {
  // Use Buffer in Node/Bun, btoa in browser
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }

  const binary = String.fromCharCode(...bytes);
  return btoa(binary);
}

/**
 * Convert base64 string to bytes
 */
export function fromBase64(base64: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(base64, "base64"));
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

/**
 * Secure wrapper for sensitive data
 */
export class SecureBuffer {
  private data: Uint8Array;
  private destroyed = false;

  constructor(length: number);
  constructor(data: Uint8Array);
  constructor(arg: number | Uint8Array) {
    if (typeof arg === "number") {
      this.data = new Uint8Array(arg);
    } else {
      this.data = new Uint8Array(arg);
    }
  }

  /**
   * Get the underlying buffer
   * @throws if buffer has been destroyed
   */
  get(): Uint8Array {
    if (this.destroyed) {
      throw new Error("Buffer has been destroyed");
    }
    return this.data;
  }

  /**
   * Get a copy of the buffer
   */
  copy(): Uint8Array {
    if (this.destroyed) {
      throw new Error("Buffer has been destroyed");
    }
    return new Uint8Array(this.data);
  }

  /**
   * Destroy the buffer, zeroing its contents
   */
  destroy(): void {
    if (!this.destroyed) {
      zeroize(this.data);
      this.destroyed = true;
    }
  }

  /**
   * Check if buffer has been destroyed
   */
  isDestroyed(): boolean {
    return this.destroyed;
  }

  /**
   * Get buffer length
   */
  get length(): number {
    return this.data.length;
  }
}
