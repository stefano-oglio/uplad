import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createReadStream, existsSync } from "fs";
import { mkdir, writeFile, unlink, readFile } from "fs/promises";
import path from "path";
import { Readable } from "stream";

export interface StorageProvider {
  putObject(key: string, body: Buffer, contentType: string): Promise<void>;
  getSignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
  getObjectBuffer(key: string): Promise<Buffer>;
  deleteObject(key: string): Promise<void>;
}

class LocalStorageProvider implements StorageProvider {
  private root: string;

  constructor(root: string) {
    this.root = root;
  }

  private resolve(key: string) {
    const full = path.resolve(this.root, key);
    if (!full.startsWith(path.resolve(this.root))) {
      throw new Error("Ruta de storage inválida");
    }
    return full;
  }

  async putObject(key: string, body: Buffer, contentType: string): Promise<void> {
    void contentType;
    const full = this.resolve(key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, body);
  }

  async getSignedDownloadUrl(key: string, expiresInSeconds = 300): Promise<string> {
    // En local devolvemos un endpoint autenticado; el firmado real se hace en la ruta API.
    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
    return `${appUrl}/api/storage/local?key=${encodeURIComponent(key)}&exp=${expires}`;
  }

  async getObjectBuffer(key: string): Promise<Buffer> {
    return readFile(this.resolve(key));
  }

  async deleteObject(key: string): Promise<void> {
    const full = this.resolve(key);
    if (existsSync(full)) await unlink(full);
  }

  createReadStream(key: string) {
    return createReadStream(this.resolve(key));
  }
}

class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT || undefined;
    this.bucket = process.env.S3_BUCKET ?? "uplad";
    this.client = new S3Client({
      region: process.env.S3_REGION ?? "eu-west-1",
      endpoint,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
      credentials:
        process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.S3_ACCESS_KEY_ID,
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            }
          : undefined,
    });
  }

  async putObject(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
    );
  }

  async getSignedDownloadUrl(key: string, expiresInSeconds = 300): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: expiresInSeconds }
    );
  }

  async getObjectBuffer(key: string): Promise<Buffer> {
    const res = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key })
    );
    const stream = res.Body as Readable;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    );
  }
}

let storage: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (storage) return storage;
  const driver = process.env.STORAGE_DRIVER ?? "local";
  if (driver === "s3") {
    storage = new S3StorageProvider();
  } else {
    storage = new LocalStorageProvider(
      process.env.LOCAL_STORAGE_PATH ?? "./.data/uploads"
    );
  }
  return storage;
}

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
] as const;

export function getMaxUploadBytes(): number {
  return Number(process.env.MAX_UPLOAD_BYTES ?? 15 * 1024 * 1024);
}
