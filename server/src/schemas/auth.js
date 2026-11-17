import { z } from 'zod';

export const registerSchema = z.object({
  nama: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(80, 'Nama maksimal 80 karakter.'),
  email: z.string().trim().toLowerCase().email('Format email tidak valid.').max(254),
  password: z.string()
    .min(12, 'Password minimal 12 karakter.')
    .max(128, 'Password maksimal 128 karakter.'),
  confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi.'),
}).strict().refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Konfirmasi password tidak sama.',
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Format email tidak valid.').max(254),
  password: z.string().min(1, 'Password wajib diisi.').max(128),
}).strict();
