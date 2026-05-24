import { z } from 'zod';

export const RegisterBodySchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const CreateBusinessBodySchema = z.object({
  business_id: z.string().min(1),
  detail: z.object({
    name: z.string(),
    phone: z.string().nullish(),
    rating: z.number().nullish(),
    image_url: z.string().nullish(),
    price: z.string().nullish(),
    reviews: z.number().nullish(),
    address: z.string().nullish(),
    city: z.string().nullish(),
    transactions: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
  }),
  liked: z.boolean().optional(),
  visited: z.boolean().optional(),
});

export const UpdateBusinessBodySchema = z.object({
  liked: z.boolean().optional(),
  visited: z.boolean().optional(),
});

export const ForgotPasswordBodySchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordBodySchema = z.object({
  email: z.string().email(),
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});
