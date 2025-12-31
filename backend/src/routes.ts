import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { createUploadUrl } from "./s3.js";

export async function registerRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ ok: true }));

  // --- Projects
  app.get("/api/v1/projects", async (req) => {
    const userId = (req.user as any).sub as string;
    const projects = await app.prisma.project.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
    return { projects };
  });

  app.post("/api/v1/projects", async (req, reply) => {
    const userId = (req.user as any).sub as string;
    const body = z
      .object({
        name: z.string().min(1),
        type: z.enum(["interior", "exterior"])
      })
      .parse(req.body);

    const project = await app.prisma.project.create({ data: { userId, name: body.name, type: body.type } });
    reply.code(201);
    return { project };
  });

  app.get("/api/v1/projects/:projectId", async (req, reply) => {
    const userId = (req.user as any).sub as string;
    const params = z.object({ projectId: z.string() }).parse(req.params);
    const project = await app.prisma.project.findFirst({ where: { id: params.projectId, userId } });
    if (!project) return reply.code(404).send({ error: "not_found" });
    return { project };
  });

  app.delete("/api/v1/projects/:projectId", async (req, reply) => {
    const userId = (req.user as any).sub as string;
    const params = z.object({ projectId: z.string() }).parse(req.params);
    const deleted = await app.prisma.project.deleteMany({ where: { id: params.projectId, userId } });
    if (deleted.count === 0) return reply.code(404).send({ error: "not_found" });
    reply.code(204);
    return;
  });

  // --- Captures
  app.post("/api/v1/projects/:projectId/captures:prepareUpload", async (req, reply) => {
    const userId = (req.user as any).sub as string;
    const params = z.object({ projectId: z.string() }).parse(req.params);
    const body = z
      .object({
        count: z.number().int().min(1).max(20).default(1),
        contentType: z.string().optional()
      })
      .parse(req.body ?? {});

    const project = await app.prisma.project.findFirst({ where: { id: params.projectId, userId } });
    if (!project) return reply.code(404).send({ error: "not_found" });

    const uploads = await Promise.all(
      Array.from({ length: body.count }).map(async (_, i) => {
        const key = `${userId}/${project.id}/captures/${Date.now()}-${i}.jpg`;
        const url = await createUploadUrl({
          s3: app.s3,
          bucket: app.env.S3_BUCKET,
          key,
          contentType: body.contentType
        });
        return { key, url };
      })
    );

    return { uploads };
  });

  app.post("/api/v1/projects/:projectId/captures", async (req, reply) => {
    const userId = (req.user as any).sub as string;
    const params = z.object({ projectId: z.string() }).parse(req.params);
    const body = z
      .object({
        files: z.array(z.object({ key: z.string().min(1) })).min(1),
        metadata: z.any().optional()
      })
      .parse(req.body);

    const project = await app.prisma.project.findFirst({ where: { id: params.projectId, userId } });
    if (!project) return reply.code(404).send({ error: "not_found" });

    const capture = await app.prisma.capture.create({
      data: {
        projectId: project.id,
        originalUrls: body.files.map((f) => `s3://${app.env.S3_BUCKET}/${f.key}`),
        metadata: body.metadata
      }
    });

    reply.code(201);
    return { capture };
  });

  app.get("/api/v1/projects/:projectId/captures", async (req, reply) => {
    const userId = (req.user as any).sub as string;
    const params = z.object({ projectId: z.string() }).parse(req.params);
    const project = await app.prisma.project.findFirst({ where: { id: params.projectId, userId } });
    if (!project) return reply.code(404).send({ error: "not_found" });

    const captures = await app.prisma.capture.findMany({ where: { projectId: project.id }, orderBy: { createdAt: "desc" } });
    return { captures };
  });

  // --- Scene build
  app.post("/api/v1/projects/:projectId/scene:build", async (req, reply) => {
    const userId = (req.user as any).sub as string;
    const params = z.object({ projectId: z.string() }).parse(req.params);
    const project = await app.prisma.project.findFirst({ where: { id: params.projectId, userId } });
    if (!project) return reply.code(404).send({ error: "not_found" });

    const scene = await app.prisma.scene.create({ data: { projectId: project.id, status: "queued", progress: 0 } });
    await app.jobs.enqueueSceneBuild({ sceneId: scene.id });

    reply.code(202);
    return { scene };
  });

  app.get("/api/v1/projects/:projectId/scene", async (req, reply) => {
    const userId = (req.user as any).sub as string;
    const params = z.object({ projectId: z.string() }).parse(req.params);
    const project = await app.prisma.project.findFirst({ where: { id: params.projectId, userId } });
    if (!project) return reply.code(404).send({ error: "not_found" });

    const scene = await app.prisma.scene.findFirst({ where: { projectId: project.id }, orderBy: { createdAt: "desc" } });
    if (!scene) return reply.code(404).send({ error: "not_found" });
    return { scene };
  });

  // --- Versions
  app.post("/api/v1/projects/:projectId/versions", async (req, reply) => {
    const userId = (req.user as any).sub as string;
    const params = z.object({ projectId: z.string() }).parse(req.params);
    const body = z
      .object({
        baseVersionId: z.string().optional(),
        operations: z.any()
      })
      .parse(req.body);

    const project = await app.prisma.project.findFirst({ where: { id: params.projectId, userId } });
    if (!project) return reply.code(404).send({ error: "not_found" });

    const version = await app.prisma.designVersion.create({
      data: {
        projectId: project.id,
        baseVersionId: body.baseVersionId,
        operations: body.operations
      }
    });

    reply.code(201);
    return { version };
  });

  app.get("/api/v1/projects/:projectId/versions", async (req, reply) => {
    const userId = (req.user as any).sub as string;
    const params = z.object({ projectId: z.string() }).parse(req.params);
    const project = await app.prisma.project.findFirst({ where: { id: params.projectId, userId } });
    if (!project) return reply.code(404).send({ error: "not_found" });

    const versions = await app.prisma.designVersion.findMany({ where: { projectId: project.id }, orderBy: { createdAt: "desc" } });
    return { versions };
  });

  app.get("/api/v1/projects/:projectId/versions/:versionId", async (req, reply) => {
    const userId = (req.user as any).sub as string;
    const params = z.object({ projectId: z.string(), versionId: z.string() }).parse(req.params);
    const project = await app.prisma.project.findFirst({ where: { id: params.projectId, userId } });
    if (!project) return reply.code(404).send({ error: "not_found" });

    const version = await app.prisma.designVersion.findFirst({ where: { id: params.versionId, projectId: project.id } });
    if (!version) return reply.code(404).send({ error: "not_found" });
    return { version };
  });

  // --- Snippets
  app.post("/api/v1/projects/:projectId/snippets", async (req, reply) => {
    const userId = (req.user as any).sub as string;
    const params = z.object({ projectId: z.string() }).parse(req.params);
    const body = z
      .object({
        versionId: z.string(),
        camera: z.any(),
        lightingPresetId: z.string().min(1),
        label: z.string().optional()
      })
      .parse(req.body);

    const project = await app.prisma.project.findFirst({ where: { id: params.projectId, userId } });
    if (!project) return reply.code(404).send({ error: "not_found" });

    const snippet = await app.prisma.snippet.create({
      data: {
        projectId: project.id,
        versionId: body.versionId,
        camera: body.camera,
        lightingPresetId: body.lightingPresetId,
        label: body.label
      }
    });

    reply.code(201);
    return { snippet };
  });

  app.get("/api/v1/projects/:projectId/snippets", async (req, reply) => {
    const userId = (req.user as any).sub as string;
    const params = z.object({ projectId: z.string() }).parse(req.params);
    const project = await app.prisma.project.findFirst({ where: { id: params.projectId, userId } });
    if (!project) return reply.code(404).send({ error: "not_found" });

    const snippets = await app.prisma.snippet.findMany({ where: { projectId: project.id }, orderBy: { createdAt: "desc" } });
    return { snippets };
  });

  // --- Exports (server-side from day 1)
  app.post("/api/v1/projects/:projectId/exports", async (req, reply) => {
    const userId = (req.user as any).sub as string;
    const params = z.object({ projectId: z.string() }).parse(req.params);
    const body = z
      .object({
        versionId: z.string(),
        snippetIds: z.array(z.string()).optional().default([]),
        type: z.enum(["before_after", "snippets"]),
        quality: z.enum(["standard", "high"]).default("high")
      })
      .parse(req.body);

    const project = await app.prisma.project.findFirst({ where: { id: params.projectId, userId } });
    if (!project) return reply.code(404).send({ error: "not_found" });

    const job = await app.prisma.exportJob.create({
      data: {
        projectId: project.id,
        versionId: body.versionId,
        type: body.type,
        quality: body.quality,
        snippetIds: body.snippetIds,
        status: "queued",
        progress: 0,
        resultUrls: []
      }
    });

    await app.jobs.enqueueExport({ exportJobId: job.id });

    reply.code(202);
    return { export: job };
  });

  app.get("/api/v1/projects/:projectId/exports/:exportId", async (req, reply) => {
    const userId = (req.user as any).sub as string;
    const params = z.object({ projectId: z.string(), exportId: z.string() }).parse(req.params);
    const project = await app.prisma.project.findFirst({ where: { id: params.projectId, userId } });
    if (!project) return reply.code(404).send({ error: "not_found" });

    const exportJob = await app.prisma.exportJob.findFirst({ where: { id: params.exportId, projectId: project.id } });
    if (!exportJob) return reply.code(404).send({ error: "not_found" });
    return { export: exportJob };
  });
}
