import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { pool } from './db/pool.js';
import { csrfProtection } from './lib/csrf.js';
import { requireAuth, requireRole } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { authRouter } from './routes/auth.js';
import { productsRouter } from './routes/products.js';
import { adminProductsRouter } from './routes/admin-products.js';

const app = express();
const PgSessionStore = connectPgSimple(session);

app.disable('x-powered-by');
app.set('trust proxy', config.trustProxy ? 1 : false);

app.use(helmet());
app.use(cors({
  origin: config.frontendOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
}));
app.use(express.json({ limit: '32kb', strict: true }));

app.use(session({
  name: config.sessionCookieName,
  store: new PgSessionStore({
    pool,
    tableName: 'user_sessions',
    createTableIfMissing: false,
  }),
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  proxy: config.trustProxy,
  cookie: {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: config.sessionMaxAgeMs,
  },
}));

app.use(csrfProtection);

app.get('/api/health', async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok', database: 'connected' });
});

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use(
  '/api/admin/products',
  requireAuth,
  requireRole('store_owner', 'admin'),
  adminProductsRouter,
);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
