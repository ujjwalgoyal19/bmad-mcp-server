import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type { EmbeddingPort, StoragePort } from "@bmad/mcp-core";

async function ensureBucket(s3: S3Client, bucket: string) {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch (err: any) {
    // create if 404 / Not Found
    if (err?.name === "NotFound" || err?.$metadata?.httpStatusCode === 404) {
      await s3.send(new CreateBucketCommand({ Bucket: bucket }));
    } else {
      throw err;
    }
  }
}

export function makeS3Storage(cfg: {
  endpoint: string;
  region?: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle?: boolean;
}): StoragePort {
  const s3 = new S3Client({
    endpoint: cfg.endpoint,
    region: cfg.region ?? "us-east-1",
    forcePathStyle: cfg.forcePathStyle ?? true,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });

  const ensurePromise = ensureBucket(s3, cfg.bucket).catch((e) => {
    console.error("S3 bucket error:", e);
    process.exit(1);
  });

  return {
    async putObject(key, body, mime) {
      await ensurePromise;
      await s3.send(
        new PutObjectCommand({
          Bucket: cfg.bucket,
          Key: key,
          Body: body,
          ContentType: mime,
        })
      );
      return `s3://${cfg.bucket}/${key}`;
    },
  };
}

// Minimal embedding port (stub). Replace with pgvector/Qdrant later.
export function makeNoopEmbeddings(): EmbeddingPort {
  return {
    async index(_blobId, _text, _meta) {
      /* no-op for local dev */
    },
    async search(_projectId, _query, _topK) {
      return [];
    },
  };
}
