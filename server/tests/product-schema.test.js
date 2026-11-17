import test from 'node:test';
import assert from 'node:assert/strict';
import { createProductSchema, updateProductSchema } from '../src/schemas/product.js';

const validProduct = {
  nama: 'Pupuk NPK Padi',
  kategori: 'Pupuk',
  harga: 45000,
  stok: 24,
  deskripsi: 'Pupuk majemuk untuk kebutuhan tanaman padi.',
};

test('produk valid diterima server', () => {
  assert.equal(createProductSchema.safeParse(validProduct).success, true);
});

test('harga negatif ditolak', () => {
  assert.equal(createProductSchema.safeParse({ ...validProduct, harga: -1 }).success, false);
});

test('stok desimal ditolak', () => {
  assert.equal(createProductSchema.safeParse({ ...validProduct, stok: 1.5 }).success, false);
});

test('field ownerId dari client ditolak', () => {
  assert.equal(createProductSchema.safeParse({ ...validProduct, ownerId: 'other-user' }).success, false);
});

test('update kosong ditolak', () => {
  assert.equal(updateProductSchema.safeParse({}).success, false);
});

test('image data URL/base64 dari localStorage ditolak', () => {
  assert.equal(
    createProductSchema.safeParse({ ...validProduct, imageUrl: 'data:image/png;base64,AAAA' }).success,
    false,
  );
});
