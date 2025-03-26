import crypto from "crypto";

// Algorithm and encoding constants
const ALGORITHM = "aes-256-cbc";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 16 bytes
const ENCODING = "hex";

/**
 * Generates a secure encryption key from a password string
 */
export const generateKey = (password: string): Buffer => {
  // Use PBKDF2 to generate a secure key from the password
  return crypto.scryptSync(password, "salt", KEY_LENGTH);
};

/**
 * Encrypts data using AES-256-CBC
 * @param data - Data to encrypt (string or object)
 * @param key - Optional encryption key (will use default if not provided)
 * @returns Encrypted data as a string
 */
export const encrypt = (
  data: string | object,
  key?: string | Buffer
): string => {
  try {
    // Convert object to string if needed
    const dataString = typeof data === "object" ? JSON.stringify(data) : data;

    // Use provided key or generate a default one
    const encryptionKey = Buffer.isBuffer(key)
      ? key
      : typeof key === "string"
      ? generateKey(key)
      : generateKey("defaultSecretKey");

    // Generate a random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);

    // Encrypt the data
    let encrypted = cipher.update(dataString, "utf8", ENCODING);
    encrypted += cipher.final(ENCODING);

    // Prepend IV to encrypted data (we'll need it for decryption)
    return iv.toString(ENCODING) + ":" + encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
};

/**
 * Decrypts encrypted data
 * @param encryptedData - Data to decrypt (string)
 * @param key - Optional decryption key (must match the encryption key)
 * @returns Decrypted data (tries to parse JSON if possible)
 */
export const decrypt = (
  encryptedData: string,
  key?: string | Buffer
): string | object => {
  try {
    // Split IV and encrypted data
    const parts = encryptedData.split(":");
    if (parts.length !== 2) {
      throw new Error("Invalid encrypted data format");
    }

    const iv = Buffer.from(parts[0], ENCODING);
    const encrypted = parts[1];

    // Use provided key or default
    const decryptionKey = Buffer.isBuffer(key)
      ? key
      : typeof key === "string"
      ? generateKey(key)
      : generateKey("defaultSecretKey");

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, decryptionKey, iv);

    // Decrypt the data
    let decrypted = decipher.update(encrypted, ENCODING, "utf8");
    decrypted += decipher.final("utf8");

    // Try to parse JSON if the decrypted data is a valid JSON
    try {
      return JSON.parse(decrypted);
    } catch {
      // If not a valid JSON, return as string
      return decrypted;
    }
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
};
