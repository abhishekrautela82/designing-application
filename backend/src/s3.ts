import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Env } from "./env.js";

export function createS3(env: Env): S3Client {
  return new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY,
      secretAccessKey: env.S3_SECRET_KEY
    },
    forcePathStyle: env.S3_FORCE_PATH_STYLE
  });
}

export async function createUploadUrl(params: {
  s3: S3Client;
  bucket: string;
  key: string;
  contentType?: string;
  expiresInSeconds?: number;
}): Promise<string> {
  const cmd = new PutObjectCommand({
    Bucket: params.bucket,
    Key: params.key,
    ContentType: params.contentType
  });
  return await getSignedUrl(params.s3, cmd, { expiresIn: params.expiresInSeconds ?? 900 });
}

export async function createDownloadUrl(params: {
  s3: S3Client;
  bucket: string;
  key: string;
  expiresInSeconds?: number;
}): Promise<string> {
  const cmd = new GetObjectCommand({
    Bucket: params.bucket,
    Key: params.key
  });
  return await getSignedUrl(params.s3, cmd, { expiresIn: params.expiresInSeconds ?? 900 });
}

export function parseS3Url(input: string): { bucket: string; key: string } | null {
  // Stored format: s3://bucket/key
  if (!input.startsWith("s3://")) return null;
  const withoutScheme = input.slice("s3://".length);
  const slash = withoutScheme.indexOf("/");
  if (slash <= 0) return null;
  const bucket = withoutScheme.slice(0, slash);
  const key = withoutScheme.slice(slash + 1);
  if (!bucket || !key) return null;
  return { bucket, key };
}
