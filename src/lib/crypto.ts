// =============================================================================
// Client-Side Zero-Knowledge Encryption (Web Crypto API)
// =============================================================================
// Uses the user's Solana wallet signature to derive an AES-256-GCM key.
// All encryption/decryption happens in the browser — the server never has the key.
//
// Key derivation: wallet.signMessage(deterministic_msg) → SHA-256 → AES key
// Format: base64(iv + tag + ciphertext)
// =============================================================================

const SIGN_MESSAGE = "moltghost-encryption-key-v1";
const IV_LENGTH = 12; // recommended for AES-GCM
const TAG_LENGTH = 16; // 128-bit auth tag

/**
 * Derive an AES-256-GCM CryptoKey from a Solana wallet signature.
 * The user signs a deterministic message — same wallet always produces the same key.
 */
export async function deriveEncryptionKey(
  signMessage: (message: Uint8Array) => Promise<Uint8Array>,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(SIGN_MESSAGE);
  const signature = await signMessage(messageBytes);

  // SHA-256 hash the signature to get exactly 32 bytes for AES-256
  const sigBuffer = new Uint8Array(signature).buffer as ArrayBuffer;
  const keyMaterial = await crypto.subtle.digest("SHA-256", sigBuffer);

  return crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypt a plaintext string with AES-256-GCM.
 * Returns a base64-encoded string containing iv + tag + ciphertext.
 */
export async function encrypt(
  plaintext: string,
  key: CryptoKey,
): Promise<string> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, tagLength: TAG_LENGTH * 8 },
    key,
    encoder.encode(plaintext),
  );

  // Web Crypto appends the auth tag to the ciphertext
  const combined = new Uint8Array(IV_LENGTH + cipherBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipherBuffer), IV_LENGTH);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt a base64-encoded ciphertext string with AES-256-GCM.
 */
export async function decrypt(
  ciphertext: string,
  key: CryptoKey,
): Promise<string> {
  const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, IV_LENGTH);
  const data = combined.slice(IV_LENGTH);

  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, tagLength: TAG_LENGTH * 8 },
    key,
    data,
  );

  return new TextDecoder().decode(plainBuffer);
}

/**
 * Encrypt a JS object (JSON.stringify → encrypt).
 */
export async function encryptObject(
  obj: unknown,
  key: CryptoKey,
): Promise<string> {
  return encrypt(JSON.stringify(obj), key);
}

/**
 * Decrypt a ciphertext back to a JS object (decrypt → JSON.parse).
 */
export async function decryptObject<T = unknown>(
  ciphertext: string,
  key: CryptoKey,
): Promise<T> {
  const json = await decrypt(ciphertext, key);
  return JSON.parse(json) as T;
}

/**
 * Check if a string looks like encrypted data (base64 with minimum length).
 */
export function isEncrypted(value: unknown): boolean {
  if (typeof value !== "string") return false;
  if (value.length < 40) return false; // IV + tag + at least some ciphertext
  try {
    atob(value);
    return true;
  } catch {
    return false;
  }
}
