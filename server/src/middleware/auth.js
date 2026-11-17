import { pool } from '../db/pool.js';

export async function requireAuth(req, res, next) {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({
      error: { code: 'UNAUTHENTICATED', message: 'Silakan login terlebih dahulu.' },
    });
  }

  const result = await pool.query(
    'SELECT id, full_name, email, role, status FROM users WHERE id = $1 LIMIT 1',
    [userId],
  );

  const user = result.rows[0];
  if (!user || user.status !== 'active') {
    req.session.destroy(() => {});
    return res.status(401).json({
      error: { code: 'UNAUTHENTICATED', message: 'Sesi tidak berlaku. Silakan login kembali.' },
    });
  }

  req.user = {
    id: user.id,
    nama: user.full_name,
    email: user.email,
    role: user.role,
  };
  return next();
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Kamu tidak memiliki hak akses untuk tindakan ini.' },
      });
    }
    return next();
  };
}
