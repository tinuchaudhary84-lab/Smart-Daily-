export function generateSalt(byteLength = 16): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function generateRecoveryKey(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes).map((b) => alphabet[b % alphabet.length]);
  return `${chars.slice(0, 4).join('')}-${chars.slice(4, 8).join('')}-${chars.slice(8, 12).join('')}`;
}

export async function hashSecret(secret: string, salt: string): Promise<string> {
  const normalized = secret.trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${normalized}:smart-daily-hisab-v1`);

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', data);
    // Double round key stretching with PBKDF2-like iterations over SHA-256
    let current = new Uint8Array(digest);
    for (let i = 0; i < 1000; i++) {
      const nextInput = new Uint8Array(current.length + data.length);
      nextInput.set(current);
      nextInput.set(data, current.length);
      const nextDigest = await crypto.subtle.digest('SHA-256', nextInput);
      current = new Uint8Array(nextDigest);
    }
    return Array.from(current)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Deterministic fallback only if Web Crypto subtle is unavailable
  let h1 = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    h1 ^= data[i];
    h1 = Math.imul(h1, 0x01000193);
  }
  return (h1 >>> 0).toString(16).padStart(8, '0');
}

export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
