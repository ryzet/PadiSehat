import { HttpError } from '../lib/http-error.js';

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Endpoint tidak ditemukan.' },
  });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof HttpError) {
    return res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    });
  }

  if (error?.code === '23505') {
    return res.status(409).json({
      error: { code: 'CONFLICT', message: 'Data dengan nilai tersebut sudah terdaftar.' },
    });
  }

  if (error?.type === 'entity.too.large') {
    return res.status(413).json({
      error: { code: 'PAYLOAD_TOO_LARGE', message: 'Ukuran permintaan terlalu besar.' },
    });
  }

  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'Format JSON tidak valid.' },
    });
  }

  console.error('API request failed:', error?.message || 'Unknown error');
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan pada server.' },
  });
}
