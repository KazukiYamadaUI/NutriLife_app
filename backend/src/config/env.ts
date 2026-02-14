import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().default('postgresql://localhost:5432/nutrilife'),
  JWT_SECRET: z.string().default('dev-secret-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('30d'),

  // Twilio (optional for dev)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // Gemini
  GEMINI_API_KEY: z.string().optional(),

  // Upload
  UPLOAD_DIR: z.string().default('./uploads'),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
