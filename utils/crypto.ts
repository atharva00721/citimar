type Base64String = string;
type PEMString = string;

interface EncryptedReport {
  title: Base64String;
  description: Base64String;
  is_encrypted: true;
}
async function encryptWithPublicKey(
  data: string,
  publicKeyPem: PEMString
): Promise<Base64String> {
  try {
    // Import public key with type-safe crypto operations
    const publicKey = await crypto.subtle.importKey(
      'spki',
      pemToArrayBuffer(publicKeyPem),
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true,
      ['encrypt']
    ) as CryptoKey;

    // Encrypt data with type-checked parameters
    const encrypted = await crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      new TextEncoder().encode(data)
    ) as ArrayBuffer;

    return arrayBufferToBase64(encrypted);
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
function pemToArrayBuffer(pem: PEMString): ArrayBuffer {
  const pemHeader = '-----BEGIN PUBLIC KEY-----';
  const pemFooter = '-----END PUBLIC KEY-----';
  
  if (!pem.includes(pemHeader) {
    throw new TypeError('Invalid PEM format: missing header');
  }

  const pemContents = pem
    .replace(pemHeader, '')
    .replace(pemFooter, '')
    .replace(/\s/g, '');

  return Uint8Array.from(atob(pemContents), c => c.charCodeAt(0)).buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): Base64String {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}