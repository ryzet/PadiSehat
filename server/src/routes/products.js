import { Router } from 'express';
import { pool } from '../db/pool.js';
import { HttpError, parseBody } from '../lib/http-error.js';
import { productIdSchema, productListQuerySchema } from '../schemas/product.js';

export const productsRouter = Router();

const SORT_SQL = {
  unggulan: 'is_featured DESC, name ASC',
  nama: 'name ASC',
  'nama-desc': 'name DESC',
  'harga-asc': 'price ASC, name ASC',
  'harga-desc': 'price DESC, name ASC',
  'stok-asc': 'stock ASC, name ASC',
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

function buildFilters(query) {
  const conditions = ['is_active = true'];
  const values = [];

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

productsRouter.get('/', async (req, res) => {
  const query = parseBody(productListQuerySchema, req.query);
  const filters = buildFilters(query);
  const whereSql = filters.conditions.join(' AND ');
  const countResult = await pool.query(
    'SELECT count(*)::int AS total FROM products WHERE ' + whereSql,
    filters.values,
  );

  const limitIndex = filters.values.length + 1;
  const offsetIndex = filters.values.length + 2;
  const values = [...filters.values, query.limit, (query.page - 1) * query.limit];
  const result = await pool.query(
    'SELECT id, name, category, price, stock, description, image_path, is_featured, created_at, updated_at'
    + ' FROM products WHERE ' + whereSql
    + ' ORDER BY ' + SORT_SQL[query.sort]
    + ' LIMIT $' + limitIndex + ' OFFSET $' + offsetIndex,
    values,
  );

  return res.json({
    data: result.rows.map(toProduct),
    pagination: {
      page: query.page,
      limit: query.limit,
      total: countResult.rows[0].total,
      totalPages: Math.ceil(countResult.rows[0].total / query.limit),
    },
  });
});

productsRouter.get('/:id', async (req, res) => {
  const id = productIdSchema.parse(req.params.id);
  const result = await pool.query(
    'SELECT id, name, category, price, stock, description, image_path, is_featured, created_at, updated_at '
    + 'FROM products WHERE id = $1 AND is_active = true LIMIT 1',
    [id],
  );

  if (!result.rows[0]) {
    throw new HttpError(404, 'Produk tidak ditemukan.', 'PRODUCT_NOT_FOUND');
  }
  return res.json({ data: toProduct(result.rows[0]) });
});
