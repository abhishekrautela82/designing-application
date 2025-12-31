import type { PrismaClient } from "@prisma/client";
import type { Queues } from "./queue.js";

export type Jobs = {
  enqueueSceneBuild(input: { sceneId: string }): Promise<void>;
  enqueueExport(input: { exportJobId: string }): Promise<void>;
};

export type JobHandlers = {
  handleSceneBuild(input: { sceneId: string }): Promise<void>;
  handleExport(input: { exportJobId: string }): Promise<void>;
};

export function createInProcessJobs(params: {
  prisma: PrismaClient;
  queues: Queues;
}): { jobs: Jobs; handlers: JobHandlers } {
  const { prisma, queues } = params;

  const handlers: JobHandlers = {
    async handleSceneBuild({ sceneId }) {
      await prisma.scene.update({ where: { id: sceneId }, data: { status: "running", progress: 0.1 } });
      // Placeholder: real implementation would run segmentation/depth/plane extraction.
      await new Promise((r) => setTimeout(r, 800));
      await prisma.scene.update({
        where: { id: sceneId },
        data: {
          status: "succeeded",
          progress: 1,
          artifacts: {
            note: "stub-scene",
            surfaces: ["wall", "floor", "ceiling"],
            createdAt: new Date().toISOString()
          }
        }
      });
    },
    async handleExport({ exportJobId }) {
      await prisma.exportJob.update({ where: { id: exportJobId }, data: { status: "running", progress: 0.1 } });
      // Placeholder: real implementation would render photorealistic outputs server-side.
      await new Promise((r) => setTimeout(r, 1200));
      await prisma.exportJob.update({
        where: { id: exportJobId },
        data: {
          status: "succeeded",
          progress: 1,
          resultUrls: [
            "https://example.invalid/export/result-1.jpg",
            "https://example.invalid/export/result-2.jpg"
          ]
        }
      });
    }
  };

  // Minimal queue: run in-process. We add a separate worker service next.
  const jobs: Jobs = {
    async enqueueSceneBuild(input) {
      await queues.scene.add("scene-build", input, {
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 1000 }
      });
    },
    async enqueueExport(input) {
      await queues.export.add("export", input, {
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 1000 }
      });
    }
  };

  return { jobs, handlers };
}
