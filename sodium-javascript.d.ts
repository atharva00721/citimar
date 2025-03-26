declare module 'sodium-javascript' {
    const ready: Promise<void>;
    const crypto_secretbox_NONCEBYTES: number;
    const crypto_secretbox_KEYBYTES: number;
  
    function ready(): Promise<void>;
    function crypto_secretbox_keygen(): Uint8Array;
    function randombytes_buf(length: number): Uint8Array;
    function crypto_secretbox_easy(message: Uint8Array, nonce: Uint8Array, key: Uint8Array): Uint8Array;
    function crypto_secretbox_open_easy(cipher: Uint8Array, nonce: Uint8Array, key: Uint8Array): Uint8Array | false;
    function to_base64(input: Uint8Array, variant: number): string;
    function from_base64(input: string, variant: number): Uint8Array;
    function from_string(input: string): Uint8Array;
    function to_string(input: Uint8Array): string;
    const base64_variants: {
        ORIGINAL: number;
        URLSAFE: number;
        URLSAFE_NO_PADDING: number;
    };
  
    export default {
      ready,
      crypto_secretbox_NONCEBYTES,
      crypto_secretbox_KEYBYTES,
      crypto_secretbox_keygen,
      randombytes_buf,
      crypto_secretbox_easy,
      crypto_secretbox_open_easy,
      to_base64,
      from_base64,
      from_string,
      to_string,
      base64_variants,
    };
  }
  