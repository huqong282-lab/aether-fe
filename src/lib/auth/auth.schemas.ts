import { z } from 'zod'

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

export const registerFormSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, 'Email wajib diisi')
      .email('Format email tidak valid'),
    username: z
      .string()
      .trim()
      .min(3, 'Username minimal 3 karakter')
      .max(30, 'Username maksimal 30 karakter'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Password dan konfirmasi password tidak sama',
  })

export type LoginFormValues = z.infer<typeof loginFormSchema>
export type RegisterFormValues = z.infer<typeof registerFormSchema>

