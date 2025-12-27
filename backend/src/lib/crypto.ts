import crypto from 'crypto';
import { env } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypt sensitive data (like n8n API keys)
 */
export function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
        ALGORITHM,
        Buffer.from(env.ENCRYPTION_KEY),
        iv
    );

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedData: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        Buffer.from(env.ENCRYPTION_KEY),
        iv
    );

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

/**
 * Generate API key with prefix
 */
export function generateApiKey(): { key: string; hash: string; prefix: string } {
    const key = `nmcp_${crypto.randomBytes(32).toString('hex')}`;
    const hash = crypto.createHash('sha256').update(key).digest('hex');
    const prefix = key.substring(0, 12);

    return { key, hash, prefix };
}

/**
 * Hash API key for storage/lookup
 */
export function hashApiKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
}

// Alias for backward compatibility
export { decrypt as decryptApiKey };
