import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function workOnce() {
  const scene = await prisma.scene.findFirst({ where: { status: "queued" }, orderBy: { createdAt: "asc" } });
  if (scene) {
    await prisma.scene.update({ where: { id: scene.id }, data: { status: "running", progress: 0.1 } });
    await new Promise((r) => setTimeout(r, 800));
    await prisma.scene.update({
      where: { id: scene.id },
      data: {
        status: "succeeded",
        progress: 1,
        artifacts: {
          note: "worker-stub-scene",
          createdAt: new Date().toISOString()
        }
      }
    });
    return true;
  }

  const exportJob = await prisma.exportJob.findFirst({ where: { status: "queued" }, orderBy: { createdAt: "asc" } });
  if (exportJob) {
    await prisma.exportJob.update({ where: { id: exportJob.id }, data: { status: "running", progress: 0.1 } });
    await new Promise((r) => setTimeout(r, 1200));
    await prisma.exportJob.update({
      where: { id: exportJob.id },
      data: {
        status: "succeeded",
        progress: 1,
        resultUrls: [
          "https://example.invalid/export/result-1.jpg",
          "https://example.invalid/export/result-2.jpg"
        ]
      }
    });
    return true;
  }

  return false;
}

async function main() {
  // Simple polling worker; swap to a real queue (Redis/SQS) when ready.
  // Runs forever.
  for (;;) {
    const didWork = await workOnce();
    if (!didWork) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}

main().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
