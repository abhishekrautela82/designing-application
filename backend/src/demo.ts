import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { z } from "zod";

const envSchema = z.object({
    PORT: z.coerce.number().default(8080),
    HOST: z.string().default("127.0.0.1"),
    LOG_LEVEL: z.string().default("info"),
    JWT_SECRET: z.string().default("dev-only-change-me-please")
});

const env = envSchema.parse(process.env);

type ProjectType = "interior" | "exterior";
type Project = {
    id: string;
    userId: string;
    name: string;
    type: ProjectType;
    createdAt: string;
    updatedAt: string;
};

const projects: Project[] = [];

function cuidLike(): string {
    return "c" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const app = Fastify({
    logger: { level: env.LOG_LEVEL }
});

await app.register(cors, { origin: true, exposedHeaders: ["x-dev-token"] });
await app.register(jwt, { secret: env.JWT_SECRET });

app.get("/health", async () => ({ ok: true, mode: "demo" }));

app.addHook("onRequest", async (req, reply) => {
    const auth = req.headers.authorization;
    if (auth?.startsWith("Bearer ")) {
        try {
            await req.jwtVerify();
            return;
        } catch {
            // fallthrough
        }
    }

    // Dev fallback token.
    const devUserId = "demo-user";
    const token = app.jwt.sign({ sub: devUserId });
    reply.header("x-dev-token", token);
    (req as any).user = { sub: devUserId };
});

app.get("/api/v1/projects", async (req) => {
    const userId = (req.user as any).sub as string;
    const userProjects = projects
        .filter((p) => p.userId === userId)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return { projects: userProjects };
});

app.post("/api/v1/projects", async (req, reply) => {
    const userId = (req.user as any).sub as string;
    const body = z
        .object({
            name: z.string().min(1),
            type: z.enum(["interior", "exterior"])
        })
        .parse(req.body);

    const now = new Date().toISOString();
    const project: Project = {
        id: cuidLike(),
        userId,
        name: body.name,
        type: body.type,
        createdAt: now,
        updatedAt: now
    };
    projects.push(project);

    reply.code(201);
    return { project };
});

await app.listen({ port: env.PORT, host: env.HOST });
app.log.info(`DEMO API listening on http://${env.HOST}:${env.PORT}`);
