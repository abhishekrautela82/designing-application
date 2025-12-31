import "dotenv/config";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { Worker } from "bullmq";
import { loadEnv } from "./env.js";

const env = loadEnv();
const prisma = new PrismaClient();

const s3 = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: { accessKeyId: env.S3_ACCESS_KEY, secretAccessKey: env.S3_SECRET_KEY },
  forcePathStyle: env.S3_FORCE_PATH_STYLE
});

function makePpmImage(params: { width: number; height: number; label: string }): Buffer {
  // Very small portable pixmap for a deterministic "render" artifact.
  const { width, height, label } = params;
  const header = `P3\n# ${label}\n${width} ${height}\n255\n`;
  const pixels: string[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const r = Math.floor((x / Math.max(1, width - 1)) * 255);
      const g = Math.floor((y / Math.max(1, height - 1)) * 255);
      const b = 64;
      pixels.push(`${r} ${g} ${b}`);
    }
  }
  return Buffer.from(header + pixels.join("\n") + "\n", "utf8");
}

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

    // Placeholder server-side render: write an artifact to S3/MinIO.
    const artifact = makePpmImage({ width: 256, height: 144, label: `export-${exportJob.id}` });
    const key = `${exportJob.projectId}/exports/${exportJob.id}/${Date.now()}.ppm`;

    await s3.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
        Body: artifact,
        ContentType: "image/x-portable-pixmap"
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
