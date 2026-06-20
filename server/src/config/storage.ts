import crypto, { randomUUID } from "crypto";
import config from "./env";
import { ApiError } from "../utils/ApiError";

export type UploadScope =
  | "request-item"
  | "payment-proof"
  | "dispute"
  | "support"
  | "catalog"
  | "warehouse"
  | "logistics-packing"
  | "logistics-slip";

const SCOPE_PREFIX: Record<UploadScope, string> = {
  "request-item": "request-items",
  "payment-proof": "payment-proofs",
  dispute: "dispute-attachments",
  support: "support-attachments",
  catalog: "catalog",
  warehouse: "warehouse-photos",
  "logistics-packing": "logistics-packing",
  "logistics-slip": "logistics-slips",
};

export const MAX_UPLOAD_BATCH = 12;

export function isStorageConfigured(): boolean {
  return Boolean(
    config.CLOUDINARY_CLOUD_NAME &&
      config.CLOUDINARY_API_KEY &&
      config.CLOUDINARY_API_SECRET
  );
}

export function getStorageBucket(): string {
  return "cloudinary";
}

export function isStoragePath(value: string): boolean {
  // Cloudinary stores full HTTPS URLs, so we don't treat them as Supabase storage paths.
  return false;
}

export function getScopeFolder(scope: UploadScope): string {
  return `elios/${SCOPE_PREFIX[scope] || "misc"}`;
}

export function generateSignature(params: Record<string, any>, apiSecret: string): string {
  const sortedKeys = Object.keys(params).sort();
  const pairs = sortedKeys.map((key) => `${key}=${params[key]}`);
  const signatureString = pairs.join("&") + apiSecret;
  return crypto.createHash("sha1").update(signatureString).digest("hex");
}

export async function createSignedUploads(opts: {
  scope: UploadScope;
  ownerId: string;
  contentTypes: string[];
}): Promise<{ uploadUrl: string; publicId: string; folder: string; timestamp: number; signature: string; apiKey: string }[]> {
  if (!isStorageConfigured()) {
    throw new ApiError(503, "Cloudinary is not configured");
  }

  const folder = getScopeFolder(opts.scope);
  const timestamp = Math.round(new Date().getTime() / 1000);
  const out = [];

  for (const contentType of opts.contentTypes) {
    let resourceType = "auto";
    if (contentType.startsWith("image/")) {
      resourceType = "image";
    } else if (contentType.startsWith("video/")) {
      resourceType = "video";
    } else if (contentType.includes("pdf")) {
      resourceType = "raw";
    }

    const publicId = `${opts.ownerId.replace(/[^a-zA-Z0-9_-]/g, "") || "anon"}_${randomUUID()}`;
    const paramsToSign = {
      folder,
      public_id: publicId,
      timestamp,
    };

    const signature = generateSignature(paramsToSign, config.CLOUDINARY_API_SECRET);
    const uploadUrl = `https://api.cloudinary.com/v1_1/${config.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

    out.push({
      uploadUrl,
      publicId,
      folder,
      timestamp,
      signature,
      apiKey: config.CLOUDINARY_API_KEY,
    });
  }

  return out;
}

// Keep stubs of unused functions for backward compatibility so other controllers compile cleanly.
export async function signImageFields(
  rows: any,
  spec: any
): Promise<void> {
  // No-op for Cloudinary as it uses full HTTPS URLs directly
}

export function toStoragePath(value: unknown): unknown {
  return value;
}

export function normalizeStoragePathFields(
  data: Record<string, any>,
  fields: string[]
): void {
  // No-op for Cloudinary
}

export async function signRequestImages<T>(request: T): Promise<T> {
  return request;
}

