import sodium from "sodium-javascript";
export async function encryptData(
  data: string,
  secretKey: Uint8Array
): Promise<string> {
  await sodium.ready;
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const ciphertext = sodium.crypto_secretbox_easy(
    sodium.from_string(data),
    nonce,
    secretKey
  );
  // Corrected to include the variant argument
  return `${sodium.to_base64(
    nonce,
    sodium.base64_variants.ORIGINAL
  )}:${sodium.to_base64(ciphertext, sodium.base64_variants.ORIGINAL)}`;
}
