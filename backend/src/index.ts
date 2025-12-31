import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { PrismaClient } from "@prisma/client";
import { loadEnv } from "./env.js";
import { createS3 } from "./s3.js";
import { registerRoutes } from "./routes.js";
import { createInProcessJobs } from "./jobs.js";

const env = loadEnv();

const app = Fastify({
  logger: {
    level: env.LOG_LEVEL
  }
});

await app.register(cors, { origin: true });
await app.register(jwt, { secret: env.JWT_SECRET });

await app.register(swagger, {
  openapi: {
    info: {
      title: "Designing Application API",
      version: "0.1.0"
    }
  }
});
await app.register(swaggerUi, { routePrefix: "/docs" });

const prisma = new PrismaClient();
app.decorate("prisma", prisma);

const s3 = createS3(env);
app.decorate("s3", s3);

const { jobs } = createInProcessJobs({ prisma });
app.decorate("jobs", jobs);
app.decorate("env", env);

app.addHook("onRequest", async (req, reply) => {
  if (req.url.startsWith("/health") || req.url.startsWith("/docs") || req.url.startsWith("/documentation")) {
    return;
  }
  // Simple dev auth: accept a JWT if provided; otherwise create/assume a default dev user.
  // Replace with real login/verify in the next iteration.
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    try {
      await req.jwtVerify();
      return;
    } catch {
      // fallthrough
    }
  }

  // Dev fallback: ensure a user exists, then sign a token and attach it.
  const devEmail = "dev@example.com";
  const user = await prisma.user.upsert({
    where: { email: devEmail },
    update: {},
    create: { email: devEmail }
  });

  const token = app.jwt.sign({ sub: user.id });
  reply.header("x-dev-token", token);
  (req as any).user = { sub: user.id };
});

await registerRoutes(app);

app.addHook("onClose", async () => {
  await prisma.$disconnect();
});

await app.listen({ port: env.PORT, host: env.HOST });
app.log.info(`API listening on http://${env.HOST}:${env.PORT}`);
