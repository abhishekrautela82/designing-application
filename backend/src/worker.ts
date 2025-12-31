import "dotenv/config";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { Worker } from "bullmq";
import { loadEnv } from "./env.js";
import { renderPlaceholderPng } from "./render.js";

const env = loadEnv();
const prisma = new PrismaClient();

const s3 = new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    credentials: { accessKeyId: env.S3_ACCESS_KEY, secretAccessKey: env.S3_SECRET_KEY },
    forcePathStyle: env.S3_FORCE_PATH_STYLE
});

const connection = { url: env.REDIS_URL };

new Worker(
    "scene",
    async (job) => {
        const payload = job.data as { sceneId: string };
        await prisma.scene.update({ where: { id: payload.sceneId }, data: { status: "running", progress: 0.1 } });

        // TODO: segmentation/depth/planes pipeline.
        await new Promise((r) => setTimeout(r, 800));

        await prisma.scene.update({
            where: { id: payload.sceneId },
            data: {
                status: "succeeded",
                progress: 1,
                artifacts: {
                    note: "queue-worker-stub-scene",
                    createdAt: new Date().toISOString()
                }
            }
        });
    },
    { connection }
);

new Worker(
    "export",
    async (job) => {
        const payload = job.data as { exportJobId: string };
        const exportJob = await prisma.exportJob.findUnique({ where: { id: payload.exportJobId } });
        if (!exportJob) return;

        await prisma.exportJob.update({ where: { id: exportJob.id }, data: { status: "running", progress: 0.1 } });

        // Placeholder server-side render: write a PNG artifact to S3/MinIO.
        const artifact = await renderPlaceholderPng({ width: 1280, height: 720, seed: exportJob.id });
        const key = `${exportJob.projectId}/exports/${exportJob.id}/${Date.now()}.png`;

        await s3.send(
            new PutObjectCommand({
                Bucket: env.S3_BUCKET,
                Key: key,
                Body: artifact,
                ContentType: "image/png"
            })
        );

        await prisma.exportJob.update({
            where: { id: exportJob.id },
            data: {
                status: "succeeded",
                progress: 1,
                resultUrls: [`s3://${env.S3_BUCKET}/${key}`]
            }
        });
    },
    { connection }
);

// Keep process alive.
// eslint-disable-next-line no-console
console.log("Worker running (BullMQ)");
