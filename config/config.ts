import { z } from "zod";

const envSchema = z.object({
  BACKEND_PORT: z.string().optional(),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.format());
  throw new Error("Invalid environment variables");
}

export const env = {
  BACKEND_PORT: parsed.data.BACKEND_PORT,
  DATABASE_URL: parsed.data.DATABASE_URL,
};
