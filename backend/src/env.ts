import { z } from "zod";

const schema = z.object({
    PORT: z.coerce.number().default(8080),
    HOST: z.string().default("0.0.0.0"),
    LOG_LEVEL: z.string().default("info"),
    JWT_SECRET: z.string().min(16),
    DATABASE_URL: z.string().min(1),
    REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
    S3_ENDPOINT: z.string().url(),
    S3_REGION: z.string().min(1),
    S3_ACCESS_KEY: z.string().min(1),
    S3_SECRET_KEY: z.string().min(1),
    S3_BUCKET: z.string().min(1),
    S3_FORCE_PATH_STYLE: z.coerce.boolean().default(true)
});

export type Env = z.infer<typeof schema>;

export function loadEnv(): Env {
    const parsed = schema.safeParse(process.env);
    if (!parsed.success) {
        const message = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
        throw new Error(`Invalid env:\n${message}`);
    }
    return parsed.data;
}
