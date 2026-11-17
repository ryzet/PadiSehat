import { Router } from 'express';
import { writeAuditLog } from '../lib/audit.js';
import { HttpError, parseBody } from '../lib/http-error.js';
import { withUserTransaction } from '../db/with-user-transaction.js';
import {
  createProductSchema,
  productIdSchema,
  productListQuerySchema,
  updateProductSchema,
} from '../schemas/product.js';

export const adminProductsRouter = Router();

const SORT_SQL = {
  unggulan: 'is_featured DESC, name ASC',
  nama: 'name ASC',
  'nama-desc': 'name DESC',
  'harga-asc': 'price ASC, name ASC',
  'harga-desc': 'price DESC, name ASC',
  'stok-asc': 'stock ASC, name ASC',
};

const COLUMN_MAP = {
  nama: 'name',
  kategori: 'category',
  harga: 'price',
  stok: 'stock',
  deskripsi: 'description',
  imageUrl: 'image_path',
  unggulan: 'is_featured',
};

function toProduct(row) {
  return {
    id: row.id,
    nama: row.name,
    kategori: row.category,
    harga: row.price,
    stok: row.stock,
    deskripsi: row.description,
    imageUrl: row.image_path,
    unggulan: row.is_featured,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildFilters(query, ownerId) {
  const conditions = ['owner_id = $1', 'is_active = true'];
  const values = [ownerId];

  if (query.q) {
    values.push(query.q);
    const index = '$' + values.length;
    conditions.push(
      '(position(lower(' + index + ') in lower(name)) > 0'
      + ' OR position(lower(' + index + ') in lower(category)) > 0'
      + ' OR position(lower(' + index + ') in lower(description)) > 0)',
    );
  }

  if (query.kategori) {
    values.push(query.kategori);
    conditions.push('category = $' + values.length);
  }

  return { conditions, values };
}

adminProductsRouter.get('/', async (req, res) => {
  const query = parseBody(productListQuerySchema, req.query);
  const result = await withUserTransaction(req.user, async (client) => {
    const filters = buildFilters(query, req.user.id);
    const whereSql = filters.conditions.join(' AND ');
    const countResult = await client.query(
      'SELECT count(*)::int AS total FROM products WHERE ' + whereSql,
      filters.values,
    );
    const limitIndex = filters.values.length + 1;
    const offsetIndex = filters.values.length + 2;
    const values = [...filters.values, query.limit, (query.page - 1) * query.limit];
    const products = await client.query(
      'SELECT id, name, category, price, stock, description, image_path, is_featured, created_at, updated_at'
      + ' FROM products WHERE ' + whereSql
      + ' ORDER BY ' + SORT_SQL[query.sort]
      + ' LIMIT $' + limitIndex + ' OFFSET $' + offsetIndex,
      values,
    );
    return { rows: products.rows, total: countResult.rows[0].total };
  });

  return res.json({
    data: result.rows.map(toProduct),
    pagination: {
      page: query.page,
      limit: query.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / query.limit),
    },
  });
});

adminProductsRouter.post('/', async (req, res) => {
  const data = parseBody(createProductSchema, req.body);
  const product = await withUserTransaction(req.user, async (client) => {
    const result = await client.query(
      'INSERT INTO products (owner_id, name, category, price, stock, description, image_path, is_featured) '
      + 'VALUES ($1, $2, $3, $4, $5, $6, $7, $8) '
      + 'RETURNING id, name, category, price, stock, description, image_path, is_featured, created_at, updated_at',
      [
        req.user.id,
        data.nama,
        data.kategori,
        data.harga,
        data.stok,
        data.deskripsi,
        data.imageUrl ?? null,
        data.unggulan === true,
      ],
    );
    const row = result.rows[0];
    await writeAuditLog(client, {
      actorUserId: req.user.id,
      action: 'product.create',
      entityType: 'product',
      entityId: row.id,
      metadata: { fields: Object.keys(data) },
      request: req,
    });
    return row;
  });

  return res.status(201).json({ data: toProduct(product) });
});

adminProductsRouter.patch('/:id', async (req, res) => {
  const id = parseBody(productIdSchema, req.params.id);
  const data = parseBody(updateProductSchema, req.body);
  const entries = Object.entries(data);
  const assignments = entries.map(([key], index) => COLUMN_MAP[key] + ' = $' + (index + 3));
  const values = entries.map(([key, value]) => key === 'imageUrl' ? value ?? null : value);

  const product = await withUserTransaction(req.user, async (client) => {
    const result = await client.query(
      'UPDATE products SET ' + assignments.join(', ') + ', updated_at = now()'
      + ' WHERE id = $1 AND owner_id = $2 AND is_active = true'
      + ' RETURNING id, name, category, price, stock, description, image_path, is_featured, created_at, updated_at',
      [id, req.user.id, ...values],
    );
    const row = result.rows[0];
    if (!row) throw new HttpError(404, 'Produk tidak ditemukan.', 'PRODUCT_NOT_FOUND');

    await writeAuditLog(client, {
      actorUserId: req.user.id,
      action: 'product.update',
      entityType: 'product',
      entityId: row.id,
      metadata: { fields: entries.map(([key]) => key) },
      request: req,
    });
    return row;
  });

  return res.json({ data: toProduct(product) });
});

adminProductsRouter.delete('/:id', async (req, res) => {
  const id = parseBody(productIdSchema, req.params.id);
  await withUserTransaction(req.user, async (client) => {
    const result = await client.query(
      'UPDATE products SET is_active = false, updated_at = now() '
      + 'WHERE id = $1 AND owner_id = $2 AND is_active = true RETURNING id',
      [id, req.user.id],
    );
    if (!result.rows[0]) throw new HttpError(404, 'Produk tidak ditemukan.', 'PRODUCT_NOT_FOUND');

    await writeAuditLog(client, {
      actorUserId: req.user.id,
      action: 'product.archive',
      entityType: 'product',
      entityId: result.rows[0].id,
      metadata: {},
      request: req,
    });
  });

  return res.status(204).end();
});
