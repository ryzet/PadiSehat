import test from 'node:test';
import assert from 'node:assert/strict';
import { loginSchema, registerSchema } from '../src/schemas/auth.js';

test('registrasi menerima password dan konfirmasi yang sama', () => {
  const result = registerSchema.safeParse({
    nama: 'Petani Uji',
    email: '  PETANI@example.com ',
    password: 'Password Aman 123',
    confirmPassword: 'Password Aman 123',
  });

  assert.equal(result.success, true);
  assert.equal(result.data.email, 'petani@example.com');
});

test('registrasi menolak konfirmasi password yang berbeda', () => {
  const result = registerSchema.safeParse({
    nama: 'Petani Uji',
    email: 'petani@example.com',
    password: 'Password Aman 123',
    confirmPassword: 'Password Salah 123',
  });

  assert.equal(result.success, false);
  assert.ok(result.error.issues.some((issue) => issue.path[0] === 'confirmPassword'));
});

test('registrasi menolak password kurang dari 12 karakter', () => {
  const result = registerSchema.safeParse({
    nama: 'Petani Uji',
    email: 'petani@example.com',
    password: 'pendek',
    confirmPassword: 'pendek',
  });

  assert.equal(result.success, false);
});

test('login hanya membutuhkan email dan password', () => {
  const result = loginSchema.safeParse({
    email: 'PETANI@example.com',
    password: 'Password Aman 123',
  });

  assert.equal(result.success, true);
  assert.equal(result.data.email, 'petani@example.com');
});
