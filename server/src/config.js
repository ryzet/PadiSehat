import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error('Environment variable ' + name + ' wajib diisi.');
  return value;
}

const nodeEnv = process.env.NODE_ENV || 'development';
const databaseUrl = required('DATABASE_URL');
const frontendOrigin = required('FRONTEND_ORIGIN');
const sessionSecret = required('SESSION_SECRET');

if (!['postgres:', 'postgresql:'].includes(new URL(databaseUrl).protocol)) {
  throw new Error('DATABASE_URL harus menggunakan protokol PostgreSQL.');
}

const frontendUrl = new URL(frontendOrigin);
if (!['http:', 'https:'].includes(frontendUrl.protocol)) {
  throw new Error('FRONTEND_ORIGIN harus berupa origin HTTP atau HTTPS.');
}
if (nodeEnv === 'production' && frontendUrl.protocol !== 'https:') {
  throw new Error('FRONTEND_ORIGIN wajib HTTPS pada production.');
}
if (sessionSecret.length < 32) {
  throw new Error('SESSION_SECRET minimal 32 karakter acak.');
}

const port = Number(process.env.PORT || 3000);
const sessionMaxAgeMs = Number(process.env.SESSION_MAX_AGE_MS || 604800000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT tidak valid.');
}
if (!Number.isInteger(sessionMaxAgeMs) || sessionMaxAgeMs < 60000) {
  throw new Error('SESSION_MAX_AGE_MS tidak valid.');
}

export const config = Object.freeze({
  nodeEnv,
  isProduction: nodeEnv === 'production',
  port,
  databaseUrl,
  databaseSsl: process.env.DATABASE_SSL === 'true',
  frontendOrigin: frontendUrl.origin,
  sessionSecret,
  sessionCookieName: process.env.SESSION_COOKIE_NAME || 'padisehat.sid',
  sessionMaxAgeMs,
  trustProxy: process.env.TRUST_PROXY === 'true',
});
