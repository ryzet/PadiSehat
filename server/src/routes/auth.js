import { randomBytes } from 'node:crypto';
import argon2 from 'argon2';
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { pool } from '../db/pool.js';
import { writeAuditLog } from '../lib/audit.js';
import { HttpError, parseBody } from '../lib/http-error.js';
import { loginSchema, registerSchema } from '../schemas/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { config } from '../config.js';

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: { code: 'RATE_LIMITED', message: 'Terlalu banyak percobaan. Coba lagi beberapa saat.' },
  },
});

function publicUser(user) {
  return {
    id: user.id,
    nama: user.full_name,
    email: user.email,
    role: user.role,
  };
}

function regenerateSession(req, userId) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) return reject(error);
      req.session.userId = userId;
      req.session.csrfToken = randomBytes(32).toString('base64url');
      req.session.save((saveError) => {
        if (saveError) return reject(saveError);
        return resolve(req.session.csrfToken);
      });
    });
  });
}

async function recordAuthAudit({ actorUserId = null, action, request, metadata = {} }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await writeAuditLog(client, {
      actorUserId,
      action,
      entityType: actorUserId ? 'user' : null,
      entityId: actorUserId,
      metadata,
      request,
    });
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

authRouter.get('/csrf', (req, res) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = randomBytes(32).toString('base64url');
  }
  res.json({ csrfToken: req.session.csrfToken });
});

authRouter.post('/register', authLimiter, async (req, res) => {
  const data = parseBody(registerSchema, req.body);
  const passwordHash = await argon2.hash(data.password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  const client = await pool.connect();
  let user;
  try {
    await client.query('BEGIN');
    const result = await client.query(
      'INSERT INTO users (full_name, email, password_hash, role, status) '
      + "VALUES ($1, $2, $3, 'customer', 'active') "
      + 'RETURNING id, full_name, email, role',
      [data.nama, data.email, passwordHash],
    );
    user = result.rows[0];

    await writeAuditLog(client, {
      actorUserId: user.id,
      action: 'auth.register',
      entityType: 'user',
      entityId: user.id,
      metadata: { role: 'customer' },
      request: req,
    });
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  const csrfToken = await regenerateSession(req, user.id);
  return res.status(201).json({
    message: 'Akun berhasil dibuat.',
    user: publicUser(user),
    csrfToken,
  });
});

authRouter.post('/login', authLimiter, async (req, res) => {
  const data = parseBody(loginSchema, req.body);
  const result = await pool.query(
    'SELECT id, full_name, email, password_hash, role, status '
    + 'FROM users WHERE email = $1 LIMIT 1',
    [data.email],
  );

  const user = result.rows[0];
  let passwordMatches = false;
  if (user && user.status === 'active') {
    try {
      passwordMatches = await argon2.verify(user.password_hash, data.password);
    } catch {
      passwordMatches = false;
    }
  }

  if (!user || !passwordMatches) {
    await recordAuthAudit({
      action: 'auth.login_failed',
      request: req,
      metadata: { reason: 'invalid_credentials' },
    });
    throw new HttpError(401, 'Email atau password tidak sesuai.', 'INVALID_CREDENTIALS');
  }

  await recordAuthAudit({
    actorUserId: user.id,
    action: 'auth.login_success',
    request: req,
  });

  const csrfToken = await regenerateSession(req, user.id);
  return res.json({
    message: 'Login berhasil.',
    user: publicUser(user),
    csrfToken,
  });
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

authRouter.post('/logout', async (req, res) => {
  if (req.session?.userId) {
    await recordAuthAudit({
      actorUserId: req.session.userId,
      action: 'auth.logout',
      request: req,
    });
  }

  await new Promise((resolve, reject) => {
    req.session.destroy((error) => error ? reject(error) : resolve());
  });

  res.clearCookie(config.sessionCookieName, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    path: '/',
  });
  return res.status(204).end();
});
