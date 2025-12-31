import { Queue } from "bullmq";
import type { Env } from "./env.js";

export type QueueNames = "scene" | "export";

export type EnqueueSceneBuildPayload = { sceneId: string };
export type EnqueueExportPayload = { exportJobId: string };

export type Queues = {
    scene: Queue<EnqueueSceneBuildPayload>;
    export: Queue<EnqueueExportPayload>;
};

export function createQueues(env: Env): Queues {
    const connection = { url: env.REDIS_URL };

    return {
        scene: new Queue<EnqueueSceneBuildPayload>("scene", { connection }),
        export: new Queue<EnqueueExportPayload>("export", { connection })
    };
}
