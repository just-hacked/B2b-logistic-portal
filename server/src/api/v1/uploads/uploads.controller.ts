import { Request, Response } from "express";
import { createSignedUploads, getStorageBucket, isStorageConfigured } from "../../../config/storage";
import { ApiResponse } from "../../../utils/ApiResponse";
import { ApiError } from "../../../utils/ApiError";

// POST /api/v1/uploads/sign — issue short-lived signed upload URLs so the client
// can upload image/video bytes directly to object storage. The body never carries
// file bytes through this server; only the returned `path` values are persisted.
export const signUpload = async (req: Request, res: Response) => {
  if (!isStorageConfigured()) {
    throw new ApiError(503, "File uploads are temporarily unavailable (storage not configured)");
  }
  const { scope, contentTypes } = req.body;
  // Namespace objects by the uploader's client id (falls back to user id for
  // admin/staff who have no client profile).
  const ownerId = req.user?.clientId ?? req.user?.userId ?? "anon";
  const uploads = await createSignedUploads({ scope, ownerId, contentTypes });
  // The client needs the bucket name to call uploadToSignedUrl(path, token, file).
  return ApiResponse.success(res, { bucket: getStorageBucket(), uploads }, "Signed upload URLs created", 201);
};

// POST /api/v1/uploads/upload-proxy — proxies the multipart file upload directly to Cloudinary
// to completely bypass any browser CORS origin restrictions.
export const uploadProxy = async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  const { api_key, timestamp, signature, folder, public_id, upload_url } = req.body;

  if (!upload_url || !upload_url.startsWith("https://api.cloudinary.com/")) {
    throw new ApiError(400, "Invalid or missing Cloudinary upload URL");
  }

  const formData = new FormData();
  const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
  formData.append("file", fileBlob, req.file.originalname);
  formData.append("api_key", api_key);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);
  formData.append("public_id", public_id);

  try {
    const response = await fetch(upload_url, {
      method: "POST",
      body: formData,
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: data });
    }

    return res.status(200).json(data);
  } catch (err: any) {
    console.error("[uploadProxy] Cloudinary proxy upload error:", err);
    throw new ApiError(502, `Failed to forward upload to Cloudinary: ${err.message}`);
  }
};
