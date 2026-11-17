import { timingSafeEqual } from 'node:crypto';
import { config } from '../config.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function csrfProtection(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get('origin');
  if (!origin || origin !== config.frontendOrigin) {
    return res.status(403).json({
      error: { code: 'ORIGIN_NOT_ALLOWED', message: 'Asal permintaan tidak diizinkan.' },
    });
  }

  const expected = req.session?.csrfToken;
  const supplied = req.get('x-csrf-token');
  if (typeof expected !== 'string' || typeof supplied !== 'string') {
    return res.status(403).json({
      error: { code: 'CSRF_INVALID', message: 'Token keamanan tidak valid atau kedaluwarsa.' },
    });
  }

  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  if (
    expectedBuffer.length !== suppliedBuffer.length
    || !timingSafeEqual(expectedBuffer, suppliedBuffer)
  ) {
    return res.status(403).json({
      error: { code: 'CSRF_INVALID', message: 'Token keamanan tidak valid atau kedaluwarsa.' },
    });
  }

  return next();
}
