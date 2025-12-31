import type { PrismaClient } from "@prisma/client";
import type { S3Client } from "@aws-sdk/client-s3";
import type { Jobs } from "./jobs.js";
import type { Env } from "./env.js";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
    s3: S3Client;
    jobs: Jobs;
    env: Env;
  }
}
