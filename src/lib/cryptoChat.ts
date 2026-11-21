export interface EncryptedChatMessage {
  id: string;
  departmentCode: string;
  senderName: string;
  senderRole: string;
  timestamp: string;
  ivBase64: string;
  cipherBase64: string;
}

async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase || "SM-ORG-001-DEFAULT-KEY"),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("supermarket-staff-erp-salt-2026"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function encryptMessage(
  plainText: string,
  passphrase: string
): Promise<{ ivBase64: string; cipherBase64: string }> {
  const key = await deriveKey(passphrase);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plainText);

  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  return {
    ivBase64: bytesToBase64(iv),
    cipherBase64: bytesToBase64(new Uint8Array(cipherBuffer)),
  };
}

export async function decryptMessage(
  cipherBase64: string,
  ivBase64: string,
  passphrase: string
): Promise<string> {
  try {
    const key = await deriveKey(passphrase);
    const iv = base64ToBytes(ivBase64);
    const cipherBytes = base64ToBytes(cipherBase64);

    const plainBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      cipherBytes
    );

    return new TextDecoder().decode(plainBuffer);
  } catch {
    return "🔒 [Encrypted Payload — Enter valid department key to decrypt]";
  }
}
