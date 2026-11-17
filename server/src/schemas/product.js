import { z } from 'zod';

const fields = {
  nama: z.string().trim().min(3, 'Nama produk minimal 3 karakter.').max(60, 'Nama produk maksimal 60 karakter.'),
  kategori: z.string().trim().min(2).max(30),
  harga: z.number().int().min(0).max(2000000000),
  stok: z.number().int().min(0).max(1000000),
  deskripsi: z.string().trim().min(10).max(300),
  imageUrl: z.string().regex(/^\/img\/[a-z0-9_-]+\.svg$/i, 'Gunakan placeholder lokal yang tersedia.').nullable().optional(),
  unggulan: z.boolean().optional(),
};

export const createProductSchema = z.object(fields).strict();

export const updateProductSchema = z.object(fields).strict().partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Minimal satu field produk harus diubah.' },
);

export const productListQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
  kategori: z.string().trim().min(2).max(30).optional(),
  sort: z.enum(['unggulan', 'nama', 'nama-desc', 'harga-asc', 'harga-desc', 'stok-asc']).default('unggulan'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
}).strict();

export const productIdSchema = z.string().uuid('ID produk tidak valid.');
