// Simple encryption for storing TradeLocker passwords
// In production, use a proper encryption service or Supabase Vault

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key-change-in-production'

export function encryptPassword(password: string): string {
  // Simple XOR encryption with base64 encoding
  // For production, use a proper encryption library like crypto-js
  const encoded = btoa(
    password
      .split('')
      .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)))
      .join('')
  )
  return encoded
}

export function decryptPassword(encrypted: string): string {
  try {
    const decoded = atob(encrypted)
    return decoded
      .split('')
      .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)))
      .join('')
  } catch {
    return ''
  }
}
